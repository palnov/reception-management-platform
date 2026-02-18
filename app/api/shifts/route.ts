
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const includeDetails = searchParams.get('includeDetails') === 'true';

        if (!start || !end) {
            return NextResponse.json({ error: 'Start and end dates required' }, { status: 400 });
        }

        const shifts = await prisma.shift.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
                isDeleted: false
            },
            include: {
                employee: true
            }
        });

        // Fetch audit logs for these shifts
        const shiftIds = shifts.map(s => s.id);
        const logs = await prisma.auditLog.findMany({
            where: {
                entityType: 'SHIFT',
                entityId: { in: shiftIds }
            },
            orderBy: { timestamp: 'desc' },
            select: includeDetails ? undefined : {
                id: true,
                entityId: true,
                entityType: true,
                action: true,
                changedBy: true,
                changedByRole: true,
                timestamp: true,
            }
        });

        // Attach logs to shifts using a Map for O(N + L) performance
        const logsByShiftId = new Map<string, any[]>();
        logs.forEach(log => {
            if (!logsByShiftId.has(log.entityId)) {
                logsByShiftId.set(log.entityId, []);
            }
            logsByShiftId.get(log.entityId)!.push(log);
        });

        const shiftsWithLogs = shifts.map(s => ({
            ...s,
            auditLogs: logsByShiftId.get(s.id) || []
        }));

        return NextResponse.json(shiftsWithLogs);
    } catch (error: any) {
        console.error('API_SHIFTS_GET_ERROR:', error);
        return NextResponse.json({ error: 'Internal Error', details: error.message }, { status: 500 });
    }
}

import { calculateDiff } from '@/lib/audit';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, date, employeeId, type, hours, cabinetClosed, centerClosed, isActingLead, coefficient } = body;

    try {
        const emp = await prisma.employee.findUnique({ where: { id: employeeId } }) as any;
        if (emp?.dismissalDate && date >= emp.dismissalDate) {
            return NextResponse.json({ error: `Employee dismissed on ${emp.dismissalDate}. Cannot create shift on ${date}.` }, { status: 400 });
        }

        if (id) {
            // Update existing (by ID)
            const existing = await prisma.shift.findUnique({ where: { id } });
            if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

            const newData = {
                date,
                employeeId,
                type,
                hours: parseFloat(hours),
                cabinetClosed: cabinetClosed || false,
                centerClosed: centerClosed || false,
                isActingLead: isActingLead || false,
                coefficient: Math.min(parseFloat(coefficient || 1.0), 1.5),
                createdBy: existing.createdBy,
                isDeleted: false // Restore if it was deleted
            };

            const diff = calculateDiff(existing, newData);

            if (!diff && !id) { // If no changes and strictly updating... but here we might just save anyway.
                // Actually if no diff, we can skip or just log "touched".
            }

            const shift = await prisma.shift.update({
                where: { id },
                data: newData as any
            });

            if (diff) {
                await logAudit('SHIFT', shift.id, 'UPDATE', diff, session);
            }
            return NextResponse.json(shift);
        } else {
            // Create or Upsert (by Employee+Date)
            const existing = await prisma.shift.findFirst({
                where: {
                    employeeId,
                    date: date
                }
            });

            if (existing) {
                const newData = {
                    type,
                    hours: parseFloat(hours),
                    cabinetClosed: cabinetClosed || false,
                    centerClosed: centerClosed || false,
                    isActingLead: isActingLead || false,
                    coefficient: Math.min(parseFloat(coefficient || 1.0), 1.5),
                    isDeleted: false // Restore
                };
                const diff = calculateDiff(existing, newData);

                const involvedEmps = await prisma.employee.findMany({
                    where: { id: { in: [employeeId] } }, // Assuming employeeId is the only involved employee for this shift update
                    select: { id: true, dismissalDate: true } as any
                }) as any[];
                const dismissalMap = new Map(involvedEmps.map((e: any) => [e.id, e.dismissalDate]));

                const shift = await prisma.shift.update({
                    where: { id: existing.id },
                    data: {
                        ...newData,
                        createdBy: existing.createdBy // Preserve original creator
                    } as any
                });

                if (diff) {
                    await logAudit('SHIFT', shift.id, 'UPDATE', diff, session);
                    // If it was deleted, maybe log a RESTORE event? Or UPDATE covers it (isDeleted changed from true to false).
                }
                return NextResponse.json(shift);
            }

            const shift = await prisma.shift.create({
                data: {
                    date: date,
                    employeeId,
                    type,
                    hours: parseFloat(hours),
                    cabinetClosed: cabinetClosed || false,
                    centerClosed: centerClosed || false,
                    isActingLead: isActingLead || false,
                    coefficient: Math.min(parseFloat(coefficient || 1.0), 1.5),
                    createdBy: session.employee.name,
                    isDeleted: false
                } as any
            });
            // For create, maybe log the whole object or just key fields?
            // logging initial values
            await logAudit('SHIFT', shift.id, 'CREATE', {
                type,
                hours: parseFloat(hours),
                cabinetClosed: !!cabinetClosed,
                centerClosed: !!centerClosed,
                isActingLead: !!isActingLead,
                coefficient: Math.min(parseFloat(coefficient || 1.0), 1.5)
            }, session);
            return NextResponse.json(shift);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existing = await prisma.shift.findUnique({ where: { id } });

    if (existing) {
        await logAudit('SHIFT', id, 'DELETE', existing, session); // Log what was deleted
        // Soft delete instead of hard delete
        await prisma.shift.update({
            where: { id },
            data: { isDeleted: true }
        });
    }

    return NextResponse.json({ success: true });
}

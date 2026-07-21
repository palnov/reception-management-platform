
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calculateDiff, logAudit } from '@/lib/audit';
import { isMonthClosed } from '@/lib/monthStatus';
import { requireSession } from '@/lib/api-auth';
import { clampShiftCoefficient } from '@/lib/employee-roles';
import { publishScheduleChange } from '@/lib/realtime-publisher';
import type { AuditLog } from '@prisma/client';

export const dynamic = 'force-dynamic';

type ShiftPayload = {
    id?: string;
    date: string;
    employeeId: string;
    type: string;
    hours: string | number;
    cabinetClosed?: boolean;
    centerClosed?: boolean;
    isActingLead?: boolean;
    isTrainee?: boolean;
    coefficient?: string | number;
};

function toNumber(value: string | number | undefined, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

async function canEditShiftForSession(role: string | undefined, sessionEmployeeId: string, employeeId: string) {
    if (role === 'MANAGER') return true;
    if (role === 'ADMIN') return employeeId === sessionEmployeeId;
    if (role !== 'SENIOR') return false;

    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { seniorId: true },
    });

    return employeeId === sessionEmployeeId || employee?.seniorId === sessionEmployeeId;
}

function isAssigningArchiveWork(role: string | undefined, type: string, existingType?: string) {
    return role === 'SENIOR' && type === 'ARCHIVE_WORK' && existingType !== 'ARCHIVE_WORK';
}

export async function GET(request: Request) {
    try {
        const auth = await requireSession();
        if (auth.response) return auth.response;

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
        const logs = shiftIds.length > 0
            ? await prisma.auditLog.findMany({
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
            })
            : [];

        // Attach logs to shifts using a Map for O(N + L) performance
        const logsByShiftId = new Map<string, AuditLog[]>();
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
    } catch (error) {
        console.error('API_SHIFTS_GET_ERROR:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = session.employee?.role;
    if (role !== 'MANAGER' && role !== 'SENIOR' && role !== 'ADMIN') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    const body = await request.json() as ShiftPayload;
    const { id, date, employeeId, cabinetClosed, centerClosed } = body;
    const { isTrainee, coefficient } = body;
    let { type, hours, isActingLead } = body;

    if (await isMonthClosed(date)) {
        return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
    }

    try {
        const emp = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { hireDate: true, dismissalDate: true, role: true, maxCoefficient: true }
        });
        const normalizedCoefficient = clampShiftCoefficient(coefficient, emp);
        if (emp?.dismissalDate && date >= emp.dismissalDate) {
            return NextResponse.json({ error: `Employee dismissed on ${emp.dismissalDate}. Cannot create shift on ${date}.` }, { status: 400 });
        }
        if (emp?.hireDate && date < emp.hireDate) {
            return NextResponse.json({ error: `Employee hired on ${emp.hireDate}. Cannot create shift on ${date}.` }, { status: 400 });
        }

        if (id) {
            // Update existing (by ID)
            const existingById = await prisma.shift.findUnique({ where: { id } });
            const existing = existingById || await prisma.shift.findFirst({
                where: { employeeId, date },
            });
            if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

            if (!await canEditShiftForSession(role, session.employee.id, existing.employeeId)) {
                return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
            }

            // ADMIN self-service can only change opening/closing flags on their own existing shift.
            if (role === 'ADMIN') {
                if (existing.employeeId !== session.employee.id) {
                    return NextResponse.json({ error: 'Admins can edit only their own shifts' }, { status: 403 });
                }
                if (employeeId !== existing.employeeId || date !== existing.date) {
                    return NextResponse.json({ error: 'Admins cannot move shifts' }, { status: 403 });
                }
                type = existing.type;
                hours = existing.hours;
                isActingLead = existing.isActingLead;
            }

            if (isAssigningArchiveWork(role, type, existing.type)) {
                return NextResponse.json({ error: 'Cannot assign archive work' }, { status: 403 });
            }

            const newData = {
                date,
                employeeId,
                type,
                hours: toNumber(hours),
                cabinetClosed: cabinetClosed || false,
                centerClosed: centerClosed || false,
                isActingLead: isActingLead || false,
                isTrainee: isTrainee || false,
                coefficient: normalizedCoefficient,
                createdBy: existing.createdBy,
                isDeleted: false // Restore if it was deleted
            };

            const diff = calculateDiff(existing, newData);

            const shift = await prisma.shift.update({
                where: { id: existing.id },
                data: newData
            });

            if (diff) {
                await logAudit('SHIFT', shift.id, 'UPDATE', diff, session);
            }
            await publishScheduleChange(date.slice(0, 7));
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
                if (!await canEditShiftForSession(role, session.employee.id, existing.employeeId)) {
                    return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
                }

                // ADMIN self-service can only change opening/closing flags on their own existing shift.
                if (role === 'ADMIN') {
                    if (existing.employeeId !== session.employee.id) {
                        return NextResponse.json({ error: 'Admins can edit only their own shifts' }, { status: 403 });
                    }
                    if (employeeId !== existing.employeeId || date !== existing.date) {
                        return NextResponse.json({ error: 'Admins cannot move shifts' }, { status: 403 });
                    }
                    type = existing.type;
                    hours = existing.hours;
                    isActingLead = existing.isActingLead;
                }

                if (isAssigningArchiveWork(role, type, existing.type)) {
                    return NextResponse.json({ error: 'Cannot assign archive work' }, { status: 403 });
                }

                const newData = {
                    type,
                    hours: toNumber(hours),
                    cabinetClosed: cabinetClosed || false,
                    centerClosed: centerClosed || false,
                    isActingLead: isActingLead || false,
                    isTrainee: isTrainee || false,
                    coefficient: normalizedCoefficient,
                    isDeleted: false // Restore
                };
                const diff = calculateDiff(existing, newData);

                const shift = await prisma.shift.update({
                    where: { id: existing.id },
                    data: {
                        ...newData,
                        createdBy: existing.createdBy // Preserve original creator
                    }
                });

                if (diff) {
                    await logAudit('SHIFT', shift.id, 'UPDATE', diff, session);
                    // If it was deleted, maybe log a RESTORE event? Or UPDATE covers it (isDeleted changed from true to false).
                }
                await publishScheduleChange(date.slice(0, 7));
                return NextResponse.json(shift);
            }

            // If it's a new shift and user is ADMIN, block it
            if (role === 'ADMIN') {
                return NextResponse.json({ error: 'Admins cannot create new shifts. Only Manager/Senior can.' }, { status: 403 });
            }

            if (!await canEditShiftForSession(role, session.employee.id, employeeId)) {
                return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
            }

            if (isAssigningArchiveWork(role, type)) {
                return NextResponse.json({ error: 'Cannot assign archive work' }, { status: 403 });
            }

            const shift = await prisma.shift.create({
                data: {
                    date: date,
                    employeeId,
                    type,
                    hours: toNumber(hours),
                    cabinetClosed: cabinetClosed || false,
                    centerClosed: centerClosed || false,
                    isActingLead: isActingLead || false,
                    isTrainee: isTrainee || false,
                    coefficient: normalizedCoefficient,
                    createdBy: session.employee.name,
                    isDeleted: false
                }
            });
            // For create, maybe log the whole object or just key fields?
            // logging initial values
            await logAudit('SHIFT', shift.id, 'CREATE', {
                type,
                hours: toNumber(hours),
                cabinetClosed: !!cabinetClosed,
                centerClosed: !!centerClosed,
                isActingLead: !!isActingLead,
                isTrainee: !!isTrainee,
                coefficient: normalizedCoefficient
            }, session);
            await publishScheduleChange(date.slice(0, 7));
            return NextResponse.json(shift);
        }
    } catch (error) {
        console.error('API_SHIFTS_POST_ERROR:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = session.employee?.role;
    if (role !== 'MANAGER' && role !== 'SENIOR') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existing = await prisma.shift.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (!await canEditShiftForSession(role, session.employee.id, existing.employeeId)) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    if (await isMonthClosed(existing.date)) {
        return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
    }

    if (existing) {
        await logAudit('SHIFT', id, 'DELETE', existing, session); // Log what was deleted
        // Soft delete instead of hard delete
        await prisma.shift.update({
            where: { id },
            data: { isDeleted: true }
        });
    }

    await publishScheduleChange(existing.date.slice(0, 7));
    return NextResponse.json({ success: true });
}

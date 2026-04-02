import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit, calculateDiff } from '@/lib/audit';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { operations, deleteIds } = body;

        const results: any = {};

        // 1. Handle Deletions (Soft Delete with Audit)
        if (Array.isArray(deleteIds) && deleteIds.length > 0) {
            const shiftsToDelete = await prisma.shift.findMany({
                where: { id: { in: deleteIds } }
            });

            if (shiftsToDelete.length > 0) {
                await prisma.$transaction([
                    ...shiftsToDelete.map(shift =>
                        prisma.auditLog.create({
                            data: {
                                entityType: 'SHIFT',
                                entityId: shift.id,
                                action: 'DELETE',
                                changedBy: session.employee.name,
                                changedByRole: session.employee.role,
                                timestamp: new Date().toISOString(),
                                details: JSON.stringify(shift)
                            }
                        })
                    ),
                    prisma.shift.updateMany({
                        where: { id: { in: shiftsToDelete.map(s => s.id) } },
                        data: { isDeleted: true }
                    })
                ]);
            }
            results.deleted = { count: deleteIds.length };
        }

        // 2. Handle Upserts (Operations)
        if (Array.isArray(operations) && operations.length > 0) {
            // Optimization: fetch all existing shifts for the given employee+date combinations
            const existingShifts = await prisma.shift.findMany({
                where: {
                    OR: operations.map(op => ({
                        employeeId: op.employeeId,
                        date: op.date
                    }))
                }
            });

            const existingMap = new Map();
            existingShifts.forEach(s => existingMap.set(`${s.employeeId}_${s.date}`, s));

            // Fetch dismissal dates for all involved employees
            const involvedEmpIds = [...new Set(operations.map(op => op.employeeId))];
            const involvedEmps = await prisma.employee.findMany({
                where: { id: { in: involvedEmpIds } },
                select: { id: true, dismissalDate: true } as any
            }) as any[];
            const dismissalMap = new Map(involvedEmps.map((e: any) => [e.id, e.dismissalDate]));

            const validOperations = operations.filter(op => {
                const dDate = dismissalMap.get(op.employeeId);
                const hDate = involvedEmps.find(e => e.id === op.employeeId)?.hireDate;
                
                if (dDate && op.date >= dDate) return false;
                if (hDate && op.date < hDate) return false;
                return true;
            });

            if (validOperations.length === 0 && operations.length > 0) {
                // All requested operations were invalid (e.g. all past dismissal)
                // We can either return error or just skip. Let's return error if all were rejected.
                // But wait, some might be valid. Let's just process the valid ones.
            }

            results.upserted = await prisma.$transaction(
                validOperations.map(op => {
                    const existing = op.id ? existingShifts.find(s => s.id === op.id) : existingMap.get(`${op.employeeId}_${op.date}`);

                    const data = {
                        type: op.type,
                        hours: parseFloat(op.hours),
                        cabinetClosed: !!op.cabinetClosed,
                        centerClosed: !!op.centerClosed,
                        isActingLead: !!op.isActingLead,
                        isTrainee: !!op.isTrainee,
                        coefficient: Math.min(parseFloat(op.coefficient || 1.0), 1.5),
                        isDeleted: false
                    };

                    if (existing) {
                        return prisma.shift.update({
                            where: { id: existing.id },
                            data: { ...data, createdBy: existing.createdBy }
                        });
                    } else {
                        return prisma.shift.create({
                            data: {
                                ...data,
                                date: op.date,
                                employeeId: op.employeeId,
                                createdBy: session.employee.name
                            }
                        });
                    }
                })
            );
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('BATCH_SHIFT_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

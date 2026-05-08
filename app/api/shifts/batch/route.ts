import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type BatchShiftOperation = {
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

type BatchShiftResults = {
    deleted?: { count: number };
    upserted?: Awaited<ReturnType<typeof prisma.shift.findMany>>;
};

function toNumber(value: string | number | undefined, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toMonthKey(date: string) {
    return date.slice(0, 7);
}

async function findClosedMonths(dates: string[]) {
    const monthKeys = [...new Set(dates.map(toMonthKey).filter(Boolean))];
    if (monthKeys.length === 0) return [];

    return prisma.closedMonth.findMany({
        where: {
            month: { in: monthKeys },
            isClosed: true,
        },
        select: { month: true },
    });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = session.employee?.role;
    if (role !== 'MANAGER' && role !== 'SENIOR') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    try {
        const body = await request.json() as { operations?: BatchShiftOperation[]; deleteIds?: string[] };
        const { operations, deleteIds } = body;

        const results: BatchShiftResults = {};

        // 1. Handle Deletions (Soft Delete with Audit)
        if (Array.isArray(deleteIds) && deleteIds.length > 0) {
            const shiftsToDelete = await prisma.shift.findMany({
                where: { id: { in: deleteIds } }
            });

            if (shiftsToDelete.length > 0) {
                const closedMonths = await findClosedMonths(shiftsToDelete.map(shift => shift.date));
                if (closedMonths.length > 0) {
                    return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
                }

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
            const closedMonths = await findClosedMonths(operations.map(op => op.date));
            if (closedMonths.length > 0) {
                return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
            }

            // Optimization: fetch all existing shifts for the given employee+date combinations
            const existingShifts = await prisma.shift.findMany({
                where: {
                    OR: operations.map(op => ({
                        employeeId: op.employeeId,
                        date: op.date
                    }))
                }
            });

            const existingMap = new Map<string, (typeof existingShifts)[number]>();
            existingShifts.forEach(s => existingMap.set(`${s.employeeId}_${s.date}`, s));

            // Fetch dismissal dates for all involved employees
            const involvedEmpIds = [...new Set(operations.map(op => op.employeeId))];
            const involvedEmps = await prisma.employee.findMany({
                where: { id: { in: involvedEmpIds } },
                select: { id: true, hireDate: true, dismissalDate: true }
            });
            const employeeDateMap = new Map(involvedEmps.map(e => [e.id, e]));

            const validOperations = operations.filter(op => {
                const employeeDates = employeeDateMap.get(op.employeeId);
                const dDate = employeeDates?.dismissalDate;
                const hDate = employeeDates?.hireDate;
                
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
                        hours: toNumber(op.hours),
                        cabinetClosed: !!op.cabinetClosed,
                        centerClosed: !!op.centerClosed,
                        isActingLead: !!op.isActingLead,
                        isTrainee: !!op.isTrainee,
                        coefficient: Math.min(toNumber(op.coefficient, 1), 1.5),
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
    } catch (error) {
        console.error('BATCH_SHIFT_ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

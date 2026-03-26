
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

async function checkManager() {
    const session = await getSession();
    return session?.employee?.role === 'MANAGER';
}

async function updateEmployeeHistory(employeeId: string, role: string, seniorId: string | null, effectiveDate?: string) {
    const oldEmployee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { role: true, seniorId: true, hireDate: true }
    });

    const roleChanged = oldEmployee?.role !== role;
    const seniorChanged = oldEmployee?.seniorId !== (seniorId || null);

    if (roleChanged || seniorChanged) {
        const dateToUse = effectiveDate || new Date().toISOString().split('T')[0];

        // 1. Close current history record (one with endDate: null)
        const currentHist = await (prisma as any).employeeRoleHistory.findFirst({
            where: { employeeId, endDate: null }
        });

        if (currentHist) {
            if (currentHist.startDate === dateToUse) {
                // If it starts today, just update it instead of closing/reopening
                await (prisma as any).employeeRoleHistory.update({
                    where: { id: currentHist.id },
                    data: { role, seniorId: seniorId || null }
                });
            } else {
                await (prisma as any).employeeRoleHistory.update({
                    where: { id: currentHist.id },
                    data: { endDate: new Date(new Date(dateToUse).getTime() - 86400000).toISOString().split('T')[0] }
                });
                await (prisma as any).employeeRoleHistory.create({
                    data: {
                        employeeId,
                        role,
                        seniorId: seniorId || null,
                        startDate: dateToUse,
                        endDate: null
                    }
                });
            }
        } else {
            // First time tracking history for this employee
            const initialStart = oldEmployee?.hireDate || '2000-01-01';

            if (initialStart >= dateToUse) {
                await (prisma as any).employeeRoleHistory.create({
                    data: {
                        employeeId,
                        role,
                        seniorId: seniorId || null,
                        startDate: dateToUse,
                        endDate: null
                    }
                });
            } else {
                await (prisma as any).employeeRoleHistory.create({
                    data: {
                        employeeId,
                        role: oldEmployee?.role || 'ADMIN',
                        seniorId: oldEmployee?.seniorId || null,
                        startDate: initialStart,
                        endDate: new Date(new Date(dateToUse).getTime() - 86400000).toISOString().split('T')[0]
                    }
                });
                await (prisma as any).employeeRoleHistory.create({
                    data: {
                        employeeId,
                        role,
                        seniorId: seniorId || null,
                        startDate: dateToUse,
                        endDate: null
                    }
                });
            }
        }
    }
}

export async function GET(request: Request) {
    try {
        const managerCount = await prisma.employee.count({
            where: { role: 'MANAGER' }
        });

        if (managerCount === 0) {
            await prisma.employee.create({
                data: {
                    name: 'Руководитель',
                    role: 'MANAGER',
                    password: 'admin',
                    baseSalary: 0,
                    hourlyRate: 0,
                    sortOrder: -1
                }
            });
        }

        const isManager = await checkManager();
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';
        const activeInDate = searchParams.get('activeInDate'); 
        const atDate = searchParams.get('atDate'); 

        const where: any = {};
        if (activeOnly) {
            const today = new Date().toISOString().split('T')[0];
            where.OR = [
                { dismissalDate: "" },
                { dismissalDate: { gt: today } }
            ];
        } else if (activeInDate) {
            // Normalize activeInDate to the end of its month
            const year = parseInt(activeInDate.substring(0, 4));
            const month = parseInt(activeInDate.substring(5, 7));
            const lastDay = new Date(year, month, 0).getDate();
            const monthEnd = `${activeInDate.substring(0, 7)}-${String(lastDay).padStart(2, '0')}`;

            where.AND = [
                {
                    OR: [
                        { dismissalDate: "" },
                        { dismissalDate: { gte: activeInDate } }
                    ]
                },
                {
                    OR: [
                        { hireDate: "" },
                        { hireDate: { lte: monthEnd } }
                    ]
                }
            ];
        }

        const employees = await prisma.employee.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                name: true,
                role: true,
                baseSalary: true,
                hireDate: true,
                branch: true,
                dismissalDate: true,
                seniorId: true,
                password: isManager,
                sortOrder: isManager,
                roleHistory: atDate ? {
                    where: {
                        startDate: { lte: atDate },
                        OR: [
                            { endDate: null },
                            { endDate: { gte: atDate } }
                        ]
                    },
                    take: 1
                } : false
            }
        } as any);

        const result = employees.map((emp: any) => {
            if (atDate && emp.roleHistory?.[0]) {
                const hist = emp.roleHistory[0];
                return {
                    ...emp,
                    role: hist.role,
                    seniorId: hist.seniorId,
                    roleHistory: undefined 
                };
            }
            if (emp.roleHistory) {
                const { roleHistory, ...rest } = emp;
                return rest;
            }
            return emp;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('API_EMPLOYEES_GET_ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!await checkManager()) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }
    const body = await request.json();
    const { name, role, baseSalary, hourlyRate, branch, password, hireDate, dismissalDate, seniorId, subordinateIds } = body;

    const lastEmployee = await prisma.employee.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
    });
    const nextOrder = (lastEmployee?.sortOrder ?? -1) + 1;

    const employee = await prisma.employee.create({
        data: {
            name,
            role,
            password: password || '1234',
            baseSalary: parseFloat(baseSalary || 0),
            hourlyRate: parseFloat(hourlyRate || 0),
            branch,
            hireDate: hireDate || '',
            dismissalDate: dismissalDate || '',
            sortOrder: nextOrder,
            seniorId: seniorId || null
        } as any
    });

    const dateToUse = new Date().toISOString().split('T')[0];
    await (prisma as any).employeeRoleHistory.create({
        data: {
            employeeId: employee.id,
            role,
            seniorId: seniorId || null,
            startDate: hireDate || dateToUse,
            endDate: null
        }
    });

    if (role === 'SENIOR' && Array.isArray(subordinateIds)) {
        for (const subId of subordinateIds) {
            const sub = await prisma.employee.findUnique({ where: { id: subId }, select: { role: true } });
            if (sub) {
                await updateEmployeeHistory(subId, sub.role, employee.id, dateToUse);
                await prisma.employee.update({
                    where: { id: subId },
                    data: { seniorId: employee.id }
                });
            }
        }
    }

    if (dismissalDate) {
        await clearFutureShifts(employee.id, dismissalDate);
    }
    return NextResponse.json(employee);
}

async function clearFutureShifts(empId: string, dismissalDate: string) {
    const session = await getSession();
    const shiftsToClear = await prisma.shift.findMany({
        where: {
            employeeId: empId,
            date: { gte: dismissalDate },
            isDeleted: false
        }
    });

    if (shiftsToClear.length > 0) {
        await prisma.$transaction([
            prisma.shift.updateMany({
                where: { id: { in: shiftsToClear.map(s => s.id) } },
                data: { isDeleted: true }
            }),
            ...shiftsToClear.map(s => prisma.auditLog.create({
                data: {
                    entityType: 'SHIFT',
                    entityId: s.id,
                    action: 'DELETE',
                    changedBy: session?.employee?.name || 'SYSTEM',
                    changedByRole: session?.employee?.role || 'SYSTEM',
                    timestamp: new Date().toISOString(),
                    details: JSON.stringify({ ...s, autoCleared: true, reason: `Employee dismissed on ${dismissalDate}` })
                }
            }))
        ]);
    }
}

export async function PUT(request: Request) {
    if (!await checkManager()) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }
    const body = await request.json();
    const { id, name, role, baseSalary, hourlyRate, branch, sortOrder, password, hireDate, dismissalDate, seniorId, subordinateIds, effectiveDate } = body;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const dateToUse = effectiveDate || new Date().toISOString().split('T')[0];

    await updateEmployeeHistory(id, role, seniorId || null, dateToUse);

    const data: any = {
        name,
        role,
        baseSalary: parseFloat(baseSalary || 0),
        hourlyRate: parseFloat(hourlyRate || 0),
        branch,
        hireDate: hireDate || '',
        dismissalDate: dismissalDate || '',
        seniorId: seniorId || null
    };

    if (password !== undefined) data.password = password;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;

    const employee = await prisma.employee.update({
        where: { id },
        data
    });

    if (role === 'SENIOR' && Array.isArray(subordinateIds)) {
        const currentSubs = await prisma.employee.findMany({
            where: { seniorId: id },
            select: { id: true, role: true }
        });

        const removedSubs = currentSubs.filter(s => !subordinateIds.includes(s.id));
        for (const sub of removedSubs) {
            await updateEmployeeHistory(sub.id, sub.role, null, dateToUse);
            await prisma.employee.update({
                where: { id: sub.id },
                data: { seniorId: null }
            });
        }

        for (const subId of subordinateIds) {
            const sub = await prisma.employee.findUnique({ where: { id: subId }, select: { role: true, seniorId: true } });
            if (sub && sub.seniorId !== id) {
                await updateEmployeeHistory(subId, sub.role, id, dateToUse);
                await prisma.employee.update({
                    where: { id: subId },
                    data: { seniorId: id }
                });
            }
        }
    } else if (role !== 'SENIOR') {
        const currentSubs = await prisma.employee.findMany({
            where: { seniorId: id },
            select: { id: true, role: true }
        });
        for (const sub of currentSubs) {
            await updateEmployeeHistory(sub.id, sub.role, null, dateToUse);
            await prisma.employee.update({
                where: { id: sub.id },
                data: { seniorId: null }
            });
        }
    }

    if (dismissalDate) {
        await clearFutureShifts(id, dismissalDate);
    }

    return NextResponse.json(employee);
}

export async function PATCH(request: Request) {
    if (!await checkManager()) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }
    const body = await request.json();
    const { employees } = body;

    if (!Array.isArray(employees)) {
        return NextResponse.json({ error: 'Array of employees required' }, { status: 400 });
    }

    const updates = employees.map(emp =>
        prisma.employee.update({
            where: { id: emp.id },
            data: { sortOrder: emp.sortOrder }
        })
    );

    await Promise.all(updates);
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    if (!await checkManager()) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    try {
        await prisma.employee.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API_EMPLOYEES_DELETE_ERROR:', error.message);
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }
}

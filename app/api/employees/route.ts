
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import type { Employee, EmployeeRoleHistory, EmployeeSalaryHistory, Prisma } from '@prisma/client';

type EmployeeListItem = Pick<Employee, 'id' | 'name' | 'role' | 'baseSalary' | 'hourlyRate' | 'hireDate' | 'branch' | 'dismissalDate' | 'seniorId'> & {
    sortOrder?: number;
    roleHistory?: EmployeeRoleHistory[];
    salaryHistory?: EmployeeSalaryHistory[];
};

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
        const currentHist = await prisma.employeeRoleHistory.findFirst({
            where: { employeeId, endDate: null }
        });

        if (currentHist) {
            if (currentHist.startDate === dateToUse) {
                // If it starts today, just update it instead of closing/reopening
                await prisma.employeeRoleHistory.update({
                    where: { id: currentHist.id },
                    data: { role, seniorId: seniorId || null }
                });
            } else {
                await prisma.employeeRoleHistory.update({
                    where: { id: currentHist.id },
                    data: { endDate: new Date(new Date(dateToUse).getTime() - 86400000).toISOString().split('T')[0] }
                });
                await prisma.employeeRoleHistory.create({
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
                await prisma.employeeRoleHistory.create({
                    data: {
                        employeeId,
                        role,
                        seniorId: seniorId || null,
                        startDate: dateToUse,
                        endDate: null
                    }
                });
            } else {
                await prisma.employeeRoleHistory.create({
                    data: {
                        employeeId,
                        role: oldEmployee?.role || 'ADMIN',
                        seniorId: oldEmployee?.seniorId || null,
                        startDate: initialStart,
                        endDate: new Date(new Date(dateToUse).getTime() - 86400000).toISOString().split('T')[0]
                    }
                });
                await prisma.employeeRoleHistory.create({
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

async function updateSalaryHistory(employeeId: string, baseSalary: number, hourlyRate: number, effectiveDate?: string) {
    const oldEmployee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { baseSalary: true, hourlyRate: true, hireDate: true }
    });

    const salaryChanged = oldEmployee?.baseSalary !== baseSalary || oldEmployee?.hourlyRate !== hourlyRate;

    if (salaryChanged) {
        // Normalize to 1st of the month as per requirements
        const dateToUse = effectiveDate 
            ? (effectiveDate.substring(0, 7) + '-01') 
            : (new Date().toISOString().substring(0, 7) + '-01');

        const currentHist = await prisma.employeeSalaryHistory.findFirst({
            where: { employeeId, endDate: null }
        });

        if (currentHist) {
            if (currentHist.startDate === dateToUse) {
                await prisma.employeeSalaryHistory.update({
                    where: { id: currentHist.id },
                    data: { baseSalary, hourlyRate }
                });
            } else {
                const prevMonthEnd = new Date(new Date(dateToUse).getTime() - 86400000).toISOString().split('T')[0];
                await prisma.employeeSalaryHistory.update({
                    where: { id: currentHist.id },
                    data: { endDate: prevMonthEnd }
                });
                await prisma.employeeSalaryHistory.create({
                    data: {
                        employeeId,
                        baseSalary,
                        hourlyRate,
                        startDate: dateToUse,
                        endDate: null
                    }
                });
            }
        } else {
            const initialStart = (oldEmployee?.hireDate || '2024-01-01').substring(0, 7) + '-01';
            if (initialStart >= dateToUse) {
                await prisma.employeeSalaryHistory.create({
                    data: {
                        employeeId,
                        baseSalary,
                        hourlyRate,
                        startDate: dateToUse,
                        endDate: null
                    }
                });
            } else {
                const prevMonthEnd = new Date(new Date(dateToUse).getTime() - 86400000).toISOString().split('T')[0];
                await prisma.employeeSalaryHistory.create({
                    data: {
                        employeeId,
                        baseSalary: oldEmployee?.baseSalary || 0,
                        hourlyRate: oldEmployee?.hourlyRate || 0,
                        startDate: initialStart,
                        endDate: prevMonthEnd
                    }
                });
                await prisma.employeeSalaryHistory.create({
                    data: {
                        employeeId,
                        baseSalary,
                        hourlyRate,
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
        const session = await getSession();
        const isManager = session?.employee?.role === 'MANAGER';
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';
        const activeInDate = searchParams.get('activeInDate'); 
        const atDate = searchParams.get('atDate'); 

        if (!session?.employee && !activeOnly) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const where: Prisma.EmployeeWhereInput = {};
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
                hourlyRate: true,
                hireDate: true,
                branch: true,
                dismissalDate: true,
                seniorId: true,
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
                } : false,
                salaryHistory: atDate ? {
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
        }) as EmployeeListItem[];

        if (!session?.employee) {
            return NextResponse.json(employees.map((emp) => ({
                id: emp.id,
                name: emp.name,
                role: emp.role
            })));
        }

        const result = employees.map((emp) => {
            let baseSalary = emp.baseSalary;
            let hourlyRate = emp.hourlyRate;
            let role = emp.role;
            let seniorId = emp.seniorId;

            if (atDate && emp.roleHistory?.[0]) {
                const hist = emp.roleHistory[0];
                role = hist.role;
                seniorId = hist.seniorId;
            }

            if (atDate && emp.salaryHistory?.[0]) {
                const sHist = emp.salaryHistory[0];
                baseSalary = sHist.baseSalary;
                hourlyRate = sHist.hourlyRate;
            }

            return {
                id: emp.id,
                name: emp.name,
                hireDate: emp.hireDate,
                branch: emp.branch,
                dismissalDate: emp.dismissalDate,
                ...(isManager ? { sortOrder: emp.sortOrder } : {}),
                role,
                seniorId,
                baseSalary,
                hourlyRate
            };
        });

        return NextResponse.json(result);
    } catch (error) {
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

    if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const lastEmployee = await prisma.employee.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
    });
    const nextOrder = (lastEmployee?.sortOrder ?? -1) + 1;

    const employee = await prisma.employee.create({
        data: {
            name,
            role,
            password: await hashPassword(password),
            baseSalary: parseFloat(baseSalary || 0),
            hourlyRate: parseFloat(hourlyRate || 0),
            branch,
            hireDate: hireDate || '',
            dismissalDate: dismissalDate || '',
            sortOrder: nextOrder,
            seniorId: seniorId || null
        }
    });

    const dateToUse = new Date().toISOString().split('T')[0];
    await prisma.employeeRoleHistory.create({
        data: {
            employeeId: employee.id,
            role,
            seniorId: seniorId || null,
            startDate: hireDate || dateToUse,
            endDate: null
        }
    });

    await prisma.employeeSalaryHistory.create({
        data: {
            employeeId: employee.id,
            baseSalary: parseFloat(baseSalary || 0),
            hourlyRate: parseFloat(hourlyRate || 0),
            startDate: (hireDate || dateToUse).substring(0, 7) + '-01',
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

    const oldEmployee = await prisma.employee.findUnique({
        where: { id },
        select: { seniorId: true }
    });
    
    // If the frontend didn't send 'seniorId' at all (undefined), preserve the existing one
    const resolvedSeniorId = seniorId !== undefined ? (seniorId || null) : oldEmployee?.seniorId;

    await updateEmployeeHistory(id, role, resolvedSeniorId, dateToUse);
    await updateSalaryHistory(id, parseFloat(baseSalary || 0), parseFloat(hourlyRate || 0), effectiveDate);

    const data: Prisma.EmployeeUncheckedUpdateInput = {
        name,
        role,
        baseSalary: parseFloat(baseSalary || 0),
        hourlyRate: parseFloat(hourlyRate || 0),
        branch,
        hireDate: hireDate || '',
        dismissalDate: dismissalDate || '',
        seniorId: resolvedSeniorId
    };

    if (password !== undefined && password !== '') data.password = await hashPassword(password);
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
    } catch (error) {
        console.error('API_EMPLOYEES_DELETE_ERROR:', error);
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }
}

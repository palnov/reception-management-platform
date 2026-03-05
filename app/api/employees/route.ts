
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

async function checkManager() {
    const session = await getSession();
    return session?.employee?.role === 'MANAGER';
}

export async function GET(request: Request) {
    try {
        // 1. Setup/Ensure at least one Manager exists
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

        // 2. Determine what data to return based on role
        const isManager = await checkManager();
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';
        const activeInDate = searchParams.get('activeInDate'); // ISO date (e.g., "2026-03-01")

        const where: any = {};
        if (activeOnly) {
            const today = new Date().toISOString().split('T')[0];
            where.OR = [
                { dismissalDate: "" },
                { dismissalDate: { gt: today } }
            ];
        } else if (activeInDate) {
            // Include employees who:
            // 1. Have no dismissal date (empty or null)
            // 2. Were dismissed ON or AFTER the activeInDate
            where.OR = [
                { dismissalDate: "" },
                { dismissalDate: { gte: activeInDate } }
            ];
        }

        const employees = await prisma.employee.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
            select: isManager ? undefined : {
                id: true,
                name: true,
                role: true,
                baseSalary: true, // Needed to prevent UI crash
                hireDate: true,
                branch: true,
                dismissalDate: true,
                seniorId: true
            }
        } as any);

        return NextResponse.json(employees);
    } catch (error: any) {
        console.error('API_EMPLOYEES_GET_ERROR:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
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

    // Handle subordinates if role is SENIOR
    if (role === 'SENIOR' && Array.isArray(subordinateIds)) {
        await (prisma.employee.updateMany as any)({
            where: { id: { in: subordinateIds } },
            data: { seniorId: employee.id }
        });
    }

    // Automatic Shift Clearing on POST (if dismissed immediately)
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
    const { id, name, role, baseSalary, hourlyRate, branch, sortOrder, password, hireDate, dismissalDate, seniorId, subordinateIds } = body;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

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

    if (password !== undefined) {
        data.password = password;
    }

    if (sortOrder !== undefined) {
        data.sortOrder = sortOrder;
    }

    const employee = await prisma.employee.update({
        where: { id },
        data
    });

    // Handle subordinates if role is SENIOR
    if (role === 'SENIOR' && Array.isArray(subordinateIds)) {
        // First disconnect all current subordinates (so we can re-assign or remove)
        await (prisma.employee.updateMany as any)({
            where: { seniorId: id } as any,
            data: { seniorId: null }
        });
        // Then assign the ones provided
        if (subordinateIds.length > 0) {
            await (prisma.employee.updateMany as any)({
                where: { id: { in: subordinateIds } },
                data: { seniorId: id }
            });
        }
    }

    // Automatic Shift Clearing on PUT
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

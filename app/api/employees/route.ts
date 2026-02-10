
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function checkManager() {
    const session = await getSession();
    return session?.employee?.role === 'MANAGER';
}

export async function GET() {
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

        const employees = await prisma.employee.findMany({
            orderBy: { sortOrder: 'asc' },
            select: isManager ? undefined : {
                id: true,
                name: true,
                role: true, // Needed for some UI logic
            }
        });

        return NextResponse.json(employees);
    } catch (error: any) {
        console.error('API_EMPLOYEES_GET_ERROR:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!await checkManager()) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }
    const body = await request.json();
    const { name, role, baseSalary, hourlyRate, branch, password } = body;

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
            sortOrder: nextOrder
        }
    });
    return NextResponse.json(employee);
}

export async function PUT(request: Request) {
    if (!await checkManager()) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }
    const body = await request.json();
    const { id, name, role, baseSalary, hourlyRate, branch, sortOrder, password } = body;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const data: any = {
        name,
        role,
        baseSalary: parseFloat(baseSalary || 0),
        hourlyRate: parseFloat(hourlyRate || 0),
        branch
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

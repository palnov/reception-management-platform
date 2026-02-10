import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getSession();
    if (!session || !session.employee?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
        where: { id: session.employee.id },
        select: { id: true, name: true, role: true, baseSalary: true, hourlyRate: true }
    });

    if (!employee) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json(employee);
}

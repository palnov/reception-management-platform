import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { login } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { employeeId, password } = await request.json();

        if (!employeeId || !password) {
            return NextResponse.json({ error: 'ID и пароль обязательны' }, { status: 400 });
        }

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId }
        });

        if (!employee || employee.password !== password) {
            return NextResponse.json({ error: 'Неверный ID или пароль' }, { status: 401 });
        }

        await login({
            id: employee.id,
            name: employee.name,
            role: employee.role
        });

        return NextResponse.json({ success: true, role: employee.role });
    } catch (error: any) {
        console.error('AUTH_LOGIN_ERROR:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

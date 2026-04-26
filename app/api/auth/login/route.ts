import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { login } from '@/lib/auth';
import { hashPassword, isHashedPassword, verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
    try {
        const { employeeId, password } = await request.json();

        if (!employeeId || !password) {
            return NextResponse.json({ error: 'ID и пароль обязательны' }, { status: 400 });
        }

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId }
        });

        if (!employee || !await verifyPassword(password, employee.password)) {
            return NextResponse.json({ error: 'Неверный ID или пароль' }, { status: 401 });
        }

        // Block login if dismissed
        if (employee.dismissalDate && employee.dismissalDate <= new Date().toISOString().split('T')[0]) {
            return NextResponse.json({ error: 'Доступ заблокирован (сотрудник уволен)' }, { status: 403 });
        }

        if (!isHashedPassword(employee.password)) {
            await prisma.employee.update({
                where: { id: employee.id },
                data: { password: await hashPassword(password) }
            });
        }

        await login({
            id: employee.id,
            name: employee.name,
            role: employee.role
        });

        return NextResponse.json({ success: true, role: employee.role });
    } catch (error: unknown) {
        console.error('AUTH_LOGIN_ERROR:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

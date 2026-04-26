import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export async function POST(request: Request) {
    try {
        const { name, id, password, pushSchema } = await request.json();

        if (pushSchema) {
            return NextResponse.json({ error: 'Schema changes must be applied from the server CLI' }, { status: 400 });
        }

        const count = await prisma.employee.count();
        if (count > 0) {
            return NextResponse.json({ error: 'System is already initialized' }, { status: 409 });
        }

        if (!name || !id || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        await prisma.employee.create({
            data: {
                id,
                name,
                password: await hashPassword(password),
                role: 'MANAGER',
                baseSalary: 0,
                hourlyRate: 0,
                branch: 'Центральный',
                hireDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            }
        });

        const currentMonth = new Date().toISOString().slice(0, 7);
        await prisma.monthlyNorm.upsert({
            where: { month: currentMonth },
            update: {},
            create: {
                month: currentMonth,
                hours: 176
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('SETUP_INIT_ERROR:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Setup initialization failed: ' + message }, { status: 500 });
    }
}

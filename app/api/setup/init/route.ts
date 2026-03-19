import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { name, id, password, pushSchema } = await request.json();

        // 1. Опционально создаем схему (таблицы)
        if (pushSchema) {
            const { execSync } = require('child_process');
            const path = require('path');
            const projectRoot = path.join(process.cwd());
            
            console.log('Running prisma db push from Setup Wizard...');
            execSync('npx --yes prisma db push', { 
                stdio: 'inherit', 
                cwd: projectRoot,
                env: { ...process.env, PRISMA_SKIP_POSTINSTALL_GENERATE: 'true' }
            });
        }

        // 2. Проверяем, не инициализирована ли уже система
        const count = await prisma.employee.count();

        if (!name || !id || !password) {
            return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 });
        }

        // 2. Создаем первого администратора (MANAGER)
        await prisma.employee.create({
            data: {
                id,
                name,
                password,
                role: 'MANAGER',
                baseSalary: 0,
                hourlyRate: 0,
                branch: 'Центральный',
                hireDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            }
        });

        // 3. (Опционально) Создаем базовую норму на текущий месяц
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
    } catch (error: any) {
        console.error('SETUP_INIT_ERROR:', error);
        return NextResponse.json({ error: 'Ошибка инициализации: ' + error.message }, { status: 500 });
    }
}

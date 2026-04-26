import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Проверяем, есть ли хотя бы один сотрудник в базе
        const count = await prisma.employee.count();
        
        return NextResponse.json({ 
            isInitialized: count > 0,
            dbConnected: true,
            schemaExists: true
        });
    } catch (error) {
        console.error('SETUP_STATUS_ERROR:', error);

        // P2021: "The table `Employee` does not exist"
        const message = error instanceof Error ? error.message : 'Database error';
        const isPrismaError = error instanceof Prisma.PrismaClientKnownRequestError;
        const isTableMissing = (isPrismaError && error.code === 'P2021') || message.includes('Table') || message.includes('does not exist');

        return NextResponse.json({ 
            isInitialized: false,
            dbConnected: !message.includes('Can\'t reach database'),
            schemaExists: !isTableMissing,
            error: message
        });
    }
}

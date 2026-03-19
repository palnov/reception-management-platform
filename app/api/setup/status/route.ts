import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    } catch (error: any) {
        console.error('SETUP_STATUS_ERROR:', error);
        
        // P2021: "The table `Employee` does not exist"
        const isTableMissing = error?.code === 'P2021' || error?.message?.includes('Table') || error?.message?.includes('does not exist');

        return NextResponse.json({ 
            isInitialized: false,
            dbConnected: !error?.message?.includes('Can\'t reach database'),
            schemaExists: !isTableMissing,
            error: error?.message || 'Database error'
        });
    }
}

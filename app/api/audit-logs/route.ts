
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const entityId = searchParams.get('entityId');
        const entityType = searchParams.get('entityType');

        if (!entityId || !entityType) {
            return NextResponse.json({ error: 'entityId and entityType are required' }, { status: 400 });
        }

        const logs = await prisma.auditLog.findMany({
            where: {
                entityId,
                entityType,
            },
            orderBy: { timestamp: 'desc' }
        });

        return NextResponse.json(logs);
    } catch (error: any) {
        console.error('API_AUDIT_LOGS_GET_ERROR:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

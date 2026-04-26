
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const auth = await requireSession();
        if (auth.response) return auth.response;

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
    } catch (error) {
        console.error('API_AUDIT_LOGS_GET_ERROR:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

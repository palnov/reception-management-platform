import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { logAudit, calculateDiff } from '@/lib/audit';
import { isMonthClosed } from '@/lib/monthStatus';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const includeDetails = searchParams.get('includeDetails') === 'true';

    try {
        const records = await prisma.dailyChecklist.findMany({
            where: {
                date: {
                    gte: start || undefined,
                    lte: end || undefined,
                }
            },
            include: {
                employee: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Fetch audit logs
        const recordIds = records.map(r => r.id);
        const logs = await prisma.auditLog.findMany({
            where: {
                entityType: 'DAILY_CHECKLIST',
                entityId: { in: recordIds }
            },
            orderBy: { timestamp: 'desc' },
            select: includeDetails ? undefined : {
                id: true,
                entityId: true,
                entityType: true,
                action: true,
                changedBy: true,
                changedByRole: true,
                timestamp: true,
            }
        });

        const logsByRecordId = new Map<string, any[]>();
        logs.forEach(log => {
            if (!logsByRecordId.has(log.entityId)) logsByRecordId.set(log.entityId, []);
            logsByRecordId.get(log.entityId)!.push(log);
        });

        const recordsWithLogs = records.map(r => ({
            ...r,
            auditLogs: logsByRecordId.get(r.id) || []
        }));

        return NextResponse.json(recordsWithLogs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { date, employeeId, criterion1, criterion2, criterion3, criterion4, criterion5, criterion6 } = body;

        if (await isMonthClosed(date)) {
            return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
        }

        const c1 = Number(criterion1) || 0;
        const c2 = Number(criterion2) || 0;
        const c3 = Number(criterion3) || 0;
        const c4 = Number(criterion4) || 0;
        const c5 = Number(criterion5) || 0;
        const c6 = Number(criterion6) || 0;

        const totalScore = (c1 + c2 + c3 + c4 + c5 + c6) / 6;

        const record = await prisma.dailyChecklist.create({
            data: {
                date,
                employeeId,
                criterion1: c1,
                criterion2: c2,
                criterion3: c3,
                criterion4: c4,
                criterion5: c5,
                criterion6: c6,
                totalScore,
                maxScore: 100,
                createdAt: new Date().toISOString(),
                createdBy: session.employee.name
            }
        });

        await logAudit('DAILY_CHECKLIST', record.id, 'CREATE', {
            date,
            employeeId,
            totalScore
        }, session);

        return NextResponse.json(record);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, date, employeeId, criterion1, criterion2, criterion3, criterion4, criterion5, criterion6 } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const existing = await prisma.dailyChecklist.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (await isMonthClosed(date)) {
            return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
        }

        const c1 = Number(criterion1) || 0;
        const c2 = Number(criterion2) || 0;
        const c3 = Number(criterion3) || 0;
        const c4 = Number(criterion4) || 0;
        const c5 = Number(criterion5) || 0;
        const c6 = Number(criterion6) || 0;

        const totalScore = (c1 + c2 + c3 + c4 + c5 + c6) / 6;

        const newData = {
            date,
            employeeId,
            criterion1: c1,
            criterion2: c2,
            criterion3: c3,
            criterion4: c4,
            criterion5: c5,
            criterion6: c6,
            totalScore
        };

        const diff = calculateDiff(existing, newData);

        const record = await prisma.dailyChecklist.update({
            where: { id },
            data: newData
        });

        if (diff) {
            await logAudit('DAILY_CHECKLIST', id, 'UPDATE', diff, session);
        }

        return NextResponse.json(record);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const existing = await prisma.dailyChecklist.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (await isMonthClosed(existing.date)) {
            return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
        }

        await logAudit('DAILY_CHECKLIST', id, 'DELETE', existing, session);
        await prisma.dailyChecklist.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit, calculateDiff } from '@/lib/audit';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
        return NextResponse.json({ error: 'Start and end dates required' }, { status: 400 });
    }

    try {
        const records = await prisma.kpiRecord.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                employee: true,
            },
        });

        // Fetch audit logs
        const recordIds = records.map(r => r.id);
        const logs = await prisma.auditLog.findMany({
            where: {
                entityType: 'KPI',
                entityId: { in: recordIds }
            },
            orderBy: { timestamp: 'desc' }
        });

        const recordsWithLogs = records.map(r => ({
            ...r,
            auditLogs: logs.filter((l: any) => l.entityId === r.id)
        }));

        return NextResponse.json(recordsWithLogs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch KPI records' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const json = await request.json();

        // Check if record exists for this employee on this day
        const existing = await prisma.kpiRecord.findFirst({
            where: {
                employeeId: json.employeeId,
                date: json.date,
            },
        });

        if (existing) {
            const newData = {
                qualityScore: parseFloat(json.qualityScore || 0),
                errorsCount: parseInt(json.errorsCount || 0),
                salesBonus: parseFloat(json.salesBonus || 0),
                checkList: parseFloat(json.checkList || 0),
            };
            const diff = calculateDiff(existing, newData);

            const updated = await prisma.kpiRecord.update({
                where: { id: existing.id },
                data: {
                    ...newData,
                    createdBy: session.employee.name
                } as any
            });

            if (diff) {
                await logAudit('KPI', updated.id, 'UPDATE', diff, session);
            }
            return NextResponse.json(updated);
        } else {
            const created = await prisma.kpiRecord.create({
                data: {
                    date: json.date,
                    employeeId: json.employeeId,
                    qualityScore: parseFloat(json.qualityScore || 0),
                    errorsCount: parseInt(json.errorsCount || 0),
                    salesBonus: parseFloat(json.salesBonus || 0),
                    checkList: parseFloat(json.checkList || 0),
                    createdBy: session.employee.name
                } as any,
            });
            await logAudit('KPI', created.id, 'CREATE', {
                qualityScore: json.qualityScore, errorsCount: json.errorsCount, salesBonus: json.salesBonus
            }, session);
            return NextResponse.json(created);
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save KPI record' }, { status: 500 });
    }
}

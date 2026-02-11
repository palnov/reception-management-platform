import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { logAudit, calculateDiff } from '@/lib/audit';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    try {
        const records = await prisma.registrationKpi.findMany({
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
                entityType: 'REGISTRATION',
                entityId: { in: recordIds }
            },
            orderBy: { timestamp: 'desc' }
        });

        const recordsWithLogs = records.map(r => ({
            ...r,
            auditLogs: logs.filter((l: any) => l.entityId === r.id)
        }));

        return NextResponse.json(recordsWithLogs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, date, employeeId, count, totalScore } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const existing = await prisma.registrationKpi.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const registrationCount = Number(count) || 0;
        const score = Number(totalScore) || 0;
        const maxPoints = registrationCount * 3;

        if (score > maxPoints) {
            return NextResponse.json({ error: `Total score (${score}) exceeds max points (${maxPoints})` }, { status: 400 });
        }

        const newData = {
            date,
            employeeId,
            count: registrationCount,
            totalScore: score,
            maxScore: maxPoints,
            patientId: '', // Reset/Not used anymore
            criterion1: 0,
            criterion2: 0,
            criterion3: 0
        };

        const diff = calculateDiff(existing, newData);

        const record = await prisma.registrationKpi.update({
            where: { id },
            data: newData as any
        });

        if (diff) {
            await logAudit('REGISTRATION', id, 'UPDATE', diff, session);
        }
        return NextResponse.json(record);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { date, employeeId, count, totalScore } = body;

        const registrationCount = Number(count) || 0;
        const score = Number(totalScore) || 0;
        const maxPoints = registrationCount * 3;

        if (score > maxPoints) {
            return NextResponse.json({ error: `Total score (${score}) exceeds max points (${maxPoints})` }, { status: 400 });
        }

        const record = await prisma.registrationKpi.create({
            data: {
                date: date,
                employeeId,
                count: registrationCount,
                totalScore: score,
                maxScore: maxPoints,
                patientId: '',
                criterion1: 0,
                criterion2: 0,
                criterion3: 0,
                createdBy: session.employee.name
            } as any
        });

        await logAudit('REGISTRATION', record.id, 'CREATE', {
            count: record.count,
            totalScore: record.totalScore
        }, session);
        return NextResponse.json(record);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const existing = await prisma.registrationKpi.findUnique({ where: { id } });
        if (existing) {
            await logAudit('REGISTRATION', id, 'DELETE', existing, session);
            await prisma.registrationKpi.delete({ where: { id } });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

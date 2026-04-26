import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { logAudit, calculateDiff } from '@/lib/audit';
import { isMonthClosed } from '@/lib/monthStatus';
import { requireSession } from '@/lib/api-auth';
import type { AuditLog } from '@prisma/client';

export async function GET(request: Request) {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const includeDetails = searchParams.get('includeDetails') === 'true';

    try {
        const sales = await prisma.promotionSale.findMany({
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
        const saleIds = sales.map(s => s.id);
        const logs = await prisma.auditLog.findMany({
            where: {
                entityType: 'SALE',
                entityId: { in: saleIds }
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

        const logsBySaleId = new Map<string, AuditLog[]>();
        logs.forEach(log => {
            if (!logsBySaleId.has(log.entityId)) logsBySaleId.set(log.entityId, []);
            logsBySaleId.get(log.entityId)!.push(log);
        });

        const salesWithLogs = sales.map(s => ({
            ...s,
            auditLogs: logsBySaleId.get(s.id) || []
        }));

        return NextResponse.json(salesWithLogs);
    } catch (error) {
        console.error('SALES_GET_ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, date, employeeId, patientId, productName, price } = body;

        if (await isMonthClosed(date)) {
            return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
        }

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const existing = await prisma.promotionSale.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const bonus = (Number(price) || 0) * 0.07;
        const newData = {
            date,
            employeeId,
            patientId,
            productName,
            price: Number(price) || 0,
            bonus: bonus
        };

        const diff = calculateDiff(existing, newData);

        const sale = await prisma.promotionSale.update({
            where: { id },
            data: newData
        });

        if (diff) {
            await logAudit('SALE', id, 'UPDATE', diff, session);
        }
        return NextResponse.json(sale);
    } catch (error) {
        console.error('SALES_PUT_ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { date, employeeId, patientId, productName, price } = body;

        if (await isMonthClosed(date)) {
            return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
        }

        const bonus = (Number(price) || 0) * 0.07;

        const sale = await prisma.promotionSale.create({
            data: {
                date: date,
                employeeId,
                patientId,
                productName,
                price: Number(price) || 0,
                bonus: bonus,
                createdBy: session.employee.name
            }
        });

        await logAudit('SALE', sale.id, 'CREATE', { productName, price, patientId }, session);
        return NextResponse.json(sale);
    } catch (error) {
        console.error('SALES_POST_ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const existing = await prisma.promotionSale.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (await isMonthClosed(existing.date)) {
            return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
        }

        if (existing) {
            await logAudit('SALE', id, 'DELETE', existing, session);
            await prisma.promotionSale.delete({ where: { id } });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('SALES_DELETE_ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

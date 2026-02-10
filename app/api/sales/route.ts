import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { logAudit, calculateDiff } from '@/lib/audit';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

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
            orderBy: { timestamp: 'desc' }
        });

        const salesWithLogs = sales.map(s => ({
            ...s,
            auditLogs: logs.filter((l: any) => l.entityId === s.id)
        }));

        return NextResponse.json(salesWithLogs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, date, employeeId, patientId, productName, price } = body;

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
            data: newData as any
        });

        if (diff) {
            await logAudit('SALE', id, 'UPDATE', diff, session);
        }
        return NextResponse.json(sale);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { date, employeeId, patientId, productName, price } = body;

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
            } as any
        });

        await logAudit('SALE', sale.id, 'CREATE', { productName, price, patientId }, session);
        return NextResponse.json(sale);
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
        const existing = await prisma.promotionSale.findUnique({ where: { id } });
        if (existing) {
            await logAudit('SALE', id, 'DELETE', existing, session);
            await prisma.promotionSale.delete({ where: { id } });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

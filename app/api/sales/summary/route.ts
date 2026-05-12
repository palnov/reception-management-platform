import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireManager } from '@/lib/api-auth';
import { summarizePromotionSales } from '@/lib/sales-summary';

export async function GET(request: Request) {
    const auth = await requireManager();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
        return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    if (start > end) {
        return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
    }

    try {
        const sales = await prisma.promotionSale.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
            select: {
                productName: true,
            },
        });

        return NextResponse.json(summarizePromotionSales(sales));
    } catch (error) {
        console.error('SALES_SUMMARY_GET_ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

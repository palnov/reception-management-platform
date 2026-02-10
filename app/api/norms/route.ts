import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');

        if (month) {
            const norm = await prisma.monthlyNorm.findUnique({
                where: { month }
            });
            return NextResponse.json(norm || { hours: 176 });
        }

        const norms = await prisma.monthlyNorm.findMany();
        return NextResponse.json(norms);
    } catch (error: any) {
        console.error('API_NORMS_GET_ERROR:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const { month, hours } = body;

    if (!month || hours === undefined) {
        return NextResponse.json({ error: 'Month and hours required' }, { status: 400 });
    }

    const norm = await prisma.monthlyNorm.upsert({
        where: { month },
        update: { hours: parseFloat(hours) },
        create: { month, hours: parseFloat(hours) }
    });

    return NextResponse.json(norm);
}

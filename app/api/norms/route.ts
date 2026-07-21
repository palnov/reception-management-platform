import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isMonthClosed } from '@/lib/monthStatus';
import { getSession } from '@/lib/auth';
import { requireSession } from '@/lib/api-auth';
import { publishScheduleChange } from '@/lib/realtime-publisher';

export async function GET(request: Request) {
    try {
        const auth = await requireSession();
        if (auth.response) return auth.response;

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
    } catch (error) {
        console.error('API_NORMS_GET_ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.employee?.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    const body = await request.json();
    const { month, hours } = body;

    if (!month || hours === undefined) {
        return NextResponse.json({ error: 'Month and hours required' }, { status: 400 });
    }

    if (await isMonthClosed(month)) {
        return NextResponse.json({ error: 'Month is closed for editing' }, { status: 403 });
    }

    const norm = await prisma.monthlyNorm.upsert({
        where: { month },
        update: { hours: parseFloat(hours) },
        create: { month, hours: parseFloat(hours) }
    });

    await publishScheduleChange(month);
    return NextResponse.json(norm);
}

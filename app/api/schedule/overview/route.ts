import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { getScheduleOverview } from '@/lib/overview-data';

export async function GET(request: Request) {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month) {
        return NextResponse.json({ error: 'Month is required' }, { status: 400 });
    }

    try {
        return NextResponse.json(await getScheduleOverview(month));
    } catch (error) {
        console.error('SCHEDULE_OVERVIEW_GET_ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch schedule overview' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { getKpiOverview } from '@/lib/overview-data';

export async function GET(request: Request) {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const month = searchParams.get('month');
    const includeDetails = searchParams.get('includeDetails') === 'true';

    if (!start || !end || !month) {
        return NextResponse.json({ error: 'Start, end and month are required' }, { status: 400 });
    }

    try {
        const overview = await getKpiOverview({
            start,
            end,
            month,
            includeDetails,
            isManager: auth.session?.employee?.role === 'MANAGER',
        });

        return NextResponse.json(overview);
    } catch (error) {
        console.error('KPI_OVERVIEW_GET_ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch KPI overview' }, { status: 500 });
    }
}

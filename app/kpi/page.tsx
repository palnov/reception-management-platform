import KpiClient from './KpiClient';
import { format } from 'date-fns';
import { getCurrentEmployee } from '@/lib/current-user';
import { getKpiOverview, getMonthRange } from '@/lib/overview-data';

export default async function KpiPage() {
    const initialMonth = format(new Date(), 'yyyy-MM');
    const { start, end } = getMonthRange(initialMonth);
    const currentUser = await getCurrentEmployee();
    const initialData = currentUser
        ? await getKpiOverview({
            start,
            end,
            month: initialMonth,
            includeDetails: true,
            isManager: currentUser.role === 'MANAGER',
        })
        : null;

    return <KpiClient initialMonth={initialMonth} initialData={initialData} />;
}

import ScheduleClient from './ScheduleClient';
import { format } from 'date-fns';
import { getCurrentEmployee } from '@/lib/current-user';
import { getScheduleOverview } from '@/lib/overview-data';

export default async function SchedulePage() {
    const initialMonth = format(new Date(), 'yyyy-MM');
    const currentUser = await getCurrentEmployee();
    const initialData = currentUser ? await getScheduleOverview(initialMonth) : null;

    return <ScheduleClient initialMonth={initialMonth} initialData={initialData} />;
}

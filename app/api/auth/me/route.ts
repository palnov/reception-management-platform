import { NextResponse } from 'next/server';
import { getCurrentEmployee } from '@/lib/current-user';

export async function GET() {
    const employee = await getCurrentEmployee();

    if (!employee) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(employee);
}

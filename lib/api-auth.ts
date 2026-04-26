import { NextResponse } from 'next/server';
import { getSession } from './auth';

export type AppSession = {
    employee?: {
        id: string;
        name: string;
        role: string;
    };
} | null;

export async function requireSession() {
    let session: AppSession = null;
    try {
        session = await getSession() as AppSession;
    } catch (error) {
        console.error('AUTH_SESSION_ERROR:', error);
        return {
            session: null,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        };
    }

    if (!session?.employee?.id) {
        return {
            session: null,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        };
    }

    return { session, response: null };
}

export async function requireManager() {
    const { session, response } = await requireSession();
    if (response) return { session: null, response };

    if (session?.employee?.role !== 'MANAGER') {
        return {
            session,
            response: NextResponse.json({ error: 'Access Denied' }, { status: 403 })
        };
    }

    return { session, response: null };
}

export async function requireScheduleEditor() {
    const { session, response } = await requireSession();
    if (response) return { session: null, response };

    if (session?.employee?.role !== 'MANAGER' && session?.employee?.role !== 'SENIOR') {
        return {
            session,
            response: NextResponse.json({ error: 'Access Denied' }, { status: 403 })
        };
    }

    return { session, response: null };
}

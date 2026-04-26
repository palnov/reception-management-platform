import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export type SessionPayload = {
    employee: {
        id: string;
        name: string;
        role: string;
    };
    expiresAt: Date | string;
};

function getSecret() {
    const value = process.env.JWT_SECRET;
    if (!value && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is required in production');
    }

    return new TextEncoder().encode(value || 'development-only-secret-change-me');
}

function useSecureCookies() {
    const value = process.env.COOKIE_SECURE;
    if (value !== undefined) {
        return value === 'true' || value === '1';
    }

    return process.env.NODE_ENV === 'production';
}

export async function login(employee: { id: string, name: string, role: string }) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await encrypt({ employee, expiresAt });

    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: useSecureCookies(),
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.set('session', '', { expires: new Date(0), path: '/' });
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function encrypt(payload: SessionPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getSecret());
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(input, getSecret(), {
            algorithms: ['HS256'],
        });
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    if (!session) return;

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session);
    if (!parsed) return;
    parsed.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: 'session',
        value: await encrypt(parsed),
        httpOnly: true,
        secure: useSecureCookies(),
        expires: parsed.expiresAt,
        sameSite: 'lax',
        path: '/',
    });
    return res;
}

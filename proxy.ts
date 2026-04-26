import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import type { JWTPayload } from 'jose';

type SessionToken = JWTPayload & {
    employee?: {
        id?: string;
        role?: string;
    };
};

const PUBLIC_PATHS = new Set(['/login', '/setup']);
const MANAGER_PATHS = ['/employees', '/data'];

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is required in production');
    }

    return new TextEncoder().encode(secret || 'development-only-secret-change-me');
}

async function readSession(token: string | undefined) {
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, getJwtSecret(), {
            algorithms: ['HS256'],
        });
        return payload as SessionToken;
    } catch {
        return null;
    }
}

function redirectToLogin(request: NextRequest) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session');
    return response;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = await readSession(request.cookies.get('session')?.value);
    const isPublicPath = PUBLIC_PATHS.has(pathname);

    if (!session?.employee?.id && !isPublicPath) {
        return redirectToLogin(request);
    }

    if (session?.employee?.id && pathname === '/login') {
        return NextResponse.redirect(new URL('/schedule', request.url));
    }

    if (MANAGER_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
        if (session?.employee?.role !== 'MANAGER') {
            return NextResponse.redirect(new URL('/schedule', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireManager, requireSession } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Expecting YYYY-MM

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 });
    }

    const closedMonth = await prisma.closedMonth.findUnique({
      where: { month }
    });

    return NextResponse.json({ 
      month, 
      isClosed: !!closedMonth?.isClosed 
    });
  } catch (error) {
    console.error('MONTH_STATUS_GET_ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireManager();
    if (auth.response) return auth.response;

    const body = await request.json();
    const { month, isClosed } = body;

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const result = await prisma.closedMonth.upsert({
      where: { month },
      update: { 
        isClosed, 
        updatedAt: now 
      },
      create: { 
        month, 
        isClosed, 
        createdAt: now, 
        updatedAt: now 
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('MONTH_STATUS_POST_ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

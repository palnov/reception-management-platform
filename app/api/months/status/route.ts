import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.employee.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Only managers can change month status' }, { status: 403 });
    }

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

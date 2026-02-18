import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const employeeId = searchParams.get('employeeId');

    if (!month) {
        return NextResponse.json({ error: 'Month is required' }, { status: 400 });
    }

    try {
        const where: any = { month };
        if (employeeId) {
            where.employeeId = employeeId;
        }

        const checklists = await prisma.monthlyChecklist.findMany({ where });
        return NextResponse.json(checklists);
    } catch (error) {
        console.error('GET /api/checklist error:', error);
        return NextResponse.json({ error: 'Failed to fetch checklists' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const json = await req.json();
        const { month, employeeId, percentage, sickLeaveOpening, sickLeaveClosing, cardCreation, updatedBy } = json;

        if (!month || !employeeId) {
            return NextResponse.json(
                { error: 'Month and employeeId are required' },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        // Upsert: create or update the monthly checklist values
        const checklist = await prisma.monthlyChecklist.upsert({
            where: {
                month_employeeId: {
                    month,
                    employeeId
                }
            },
            update: {
                ...(percentage !== undefined && { percentage: parseFloat(percentage) }),
                ...(sickLeaveOpening !== undefined && { sickLeaveOpening: parseInt(sickLeaveOpening) }),
                ...(sickLeaveClosing !== undefined && { sickLeaveClosing: parseInt(sickLeaveClosing) }),
                ...(cardCreation !== undefined && { cardCreation: parseInt(cardCreation) }),
                updatedAt: now,
                updatedBy: updatedBy || null
            },
            create: {
                month,
                employeeId,
                percentage: percentage !== undefined ? parseFloat(percentage) : 0,
                sickLeaveOpening: sickLeaveOpening !== undefined ? parseInt(sickLeaveOpening) : 0,
                sickLeaveClosing: sickLeaveClosing !== undefined ? parseInt(sickLeaveClosing) : 0,
                cardCreation: cardCreation !== undefined ? parseInt(cardCreation) : 0,
                createdAt: now,
                updatedAt: now,
                updatedBy: updatedBy || null
            }
        });

        return NextResponse.json(checklist);
    } catch (error) {
        console.error('POST /api/checklist error:', error);
        return NextResponse.json({ error: 'Failed to save checklist' }, { status: 500 });
    }
}

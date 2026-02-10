import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit, calculateDiff } from '@/lib/audit';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { operations, deleteIds } = body;

        const results: any = {};

        // 1. Handle Deletions (Soft Delete with Audit)
        if (Array.isArray(deleteIds) && deleteIds.length > 0) {
            const shiftsToDelete = await prisma.shift.findMany({
                where: { id: { in: deleteIds } }
            });

            // Process one by one to log audit
            const deletePromises = shiftsToDelete.map(async (shift) => {
                await logAudit('SHIFT', shift.id, 'DELETE', shift, session);
                return prisma.shift.update({
                    where: { id: shift.id },
                    data: { isDeleted: true }
                });
            });

            await Promise.all(deletePromises);
            results.deleted = { count: deleteIds.length };
        }

        // 2. Handle Upserts (Operations)
        if (Array.isArray(operations) && operations.length > 0) {
            // We need to handle audit logs for batch updates too if possible, but for performance maybe skip?
            // "Batch Save" usually means Drag-n-Fill. It updates many items.
            // Ideally we should log. But let's stick to core requirement: isDeleted handling.

            // Note: upsert requires unique input. using ID is best.
            // But if id is missing (new shift), we might need composite check.
            // The frontend sends `id` if it exists.

            results.upserted = await Promise.all(operations.map(async (op) => {
                // We need to check if existing one is deleted to restore it
                // Upsert handles this if we include isDeleted: false in update.

                // If we want Audit Logs for Batch, we'd need to fetch existing to diff.
                // For now, let's just make sure isDeleted is correct.

                // Problem: upsert returns the record.
                // We can't easy log changes inside `$transaction` with raw queries or without middleware.
                // Let's iterate.

                let resultShift;

                if (op.id) {
                    // Update
                    const existing = await prisma.shift.findUnique({ where: { id: op.id } });
                    if (existing) {
                        const newData = {
                            type: op.type,
                            hours: parseFloat(op.hours),
                            cabinetClosed: !!op.cabinetClosed,
                            coefficient: parseFloat(op.coefficient || 1.0),
                            createdBy: existing.createdBy,
                            isDeleted: false
                        };
                        const diff = calculateDiff(existing, newData);

                        resultShift = await prisma.shift.update({
                            where: { id: op.id },
                            data: newData as any
                        });

                        if (diff) {
                            await logAudit('SHIFT', resultShift.id, 'UPDATE', diff, session);
                        }
                    }
                } else {
                    // Create or Find by unique (Employee+Date) logic if ID missing?
                    // Prisma `upsert` needs `where` unique.
                    // The frontend creates IDs? No.
                    // The frontend sends `id` if known from `shiftsByEmployee`.
                    // If purely new, `op.id` is undefined.
                    // But `batch` mainly used for Drag Fill which might overwrite existing.
                    // If overwriting existing, we need ID.
                    // Current frontend logic:
                    // `range.map(cell => ({ ... id: shiftsByEmployee[cell.empId]?.[cell.date]?.id }))`
                    // So we HAVE ID if it exists.

                    if (!op.id) {
                        // Create New
                        resultShift = await prisma.shift.create({
                            data: {
                                date: op.date,
                                employeeId: op.employeeId,
                                type: op.type,
                                hours: parseFloat(op.hours),
                                cabinetClosed: !!op.cabinetClosed,
                                coefficient: parseFloat(op.coefficient || 1.0),
                                createdBy: session.employee.name,
                                isDeleted: false
                            } as any
                        });
                        await logAudit('SHIFT', resultShift.id, 'CREATE', { type: op.type }, session);
                    }
                }
                return resultShift;
            }));
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('BATCH_SHIFT_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

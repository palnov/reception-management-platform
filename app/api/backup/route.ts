import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session || session.employee.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    try {
        const [
            employees,
            shifts,
            kpiRecords,
            monthlyNorms,
            promotionSales,
            registrationKpis,
            monthlyChecklists,
            dailyChecklists,
            closedMonths,
            employeeRoleHistories,
            employeeSalaryHistories,
            auditLogs,
        ] = await Promise.all([
            prisma.employee.findMany(),
            prisma.shift.findMany(),
            prisma.kpiRecord.findMany(),
            prisma.monthlyNorm.findMany(),
            prisma.promotionSale.findMany(),
            prisma.registrationKpi.findMany(),
            prisma.monthlyChecklist.findMany(),
            prisma.dailyChecklist.findMany(),
            prisma.closedMonth.findMany(),
            prisma.employeeRoleHistory.findMany(),
            prisma.employeeSalaryHistory.findMany(),
            prisma.auditLog.findMany(),
        ]);

        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            employees,
            shifts,
            kpiRecords,
            monthlyNorms,
            promotionSales,
            registrationKpis,
            monthlyChecklists,
            dailyChecklists,
            closedMonths,
            employeeRoleHistories,
            employeeSalaryHistories,
            auditLogs
        };

        return new NextResponse(JSON.stringify(data, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="backup_${new Date().toISOString().split('T')[0]}.json"`
            }
        });
    } catch (error) {
        console.error('Backup Error:', error);
        return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.employee.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    try {
        const backup = await request.json();

        if (!backup.employees || !backup.shifts) {
            return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
        }

        // Transactional Restore (timeout 60s for stability)
        await prisma.$transaction(async (tx) => {
            // 1. Clear all tables in correct order
            await tx.auditLog.deleteMany();
            await tx.dailyChecklist.deleteMany();
            await tx.registrationKpi.deleteMany();
            await tx.promotionSale.deleteMany();
            await tx.kpiRecord.deleteMany();
            await tx.monthlyChecklist.deleteMany();
            await tx.shift.deleteMany();
            await tx.monthlyNorm.deleteMany();
            await tx.closedMonth.deleteMany();
            await tx.employeeSalaryHistory.deleteMany();
            await tx.employeeRoleHistory.deleteMany();
            await tx.employee.deleteMany();

            // 2. Restore Employees
            if (backup.employees && backup.employees.length > 0) {
                for (const emp of backup.employees) {
                    await tx.employee.create({
                        data: {
                            id: emp.id,
                            name: emp.name,
                            role: emp.role || 'ADMIN',
                            password: emp.password || '1234',
                            baseSalary: Number(emp.baseSalary ?? 0),
                            hourlyRate: Number(emp.hourlyRate ?? 0),
                            branch: emp.branch,
                            hireDate: emp.hireDate || '',
                            dismissalDate: emp.dismissalDate || '',
                            sortOrder: Number(emp.sortOrder ?? 0),
                            createdAt: emp.createdAt || ''
                        }
                    });
                }

                // 2.1 Second Pass for SeniorId (to avoid foreign key issues)
                for (const emp of backup.employees) {
                    if (emp.seniorId) {
                        await tx.employee.update({
                            where: { id: emp.id },
                            data: { seniorId: emp.seniorId }
                        });
                    }
                }
            }

            // 3. Restore Monthly Norms
            if (backup.monthlyNorms && backup.monthlyNorms.length > 0) {
                for (const norm of backup.monthlyNorms) {
                    await tx.monthlyNorm.create({
                        data: {
                            month: norm.month,
                            hours: Number(norm.hours ?? 176),
                            createdAt: norm.createdAt || ''
                        }
                    });
                }
            }

            // 4. Restore Shifts
            if (backup.shifts && backup.shifts.length > 0) {
                for (const s of backup.shifts) {
                    await tx.shift.create({
                        data: {
                            id: s.id,
                            date: s.date,
                            employeeId: s.employeeId,
                            type: s.type || 'REGULAR',
                            hours: Number(s.hours ?? 0),
                            cabinetClosed: Boolean(s.cabinetClosed),
                            centerClosed: Boolean(s.centerClosed),
                            isActingLead: Boolean(s.isActingLead),
                            isTrainee: Boolean(s.isTrainee),
                            coefficient: Number(s.coefficient ?? 1.0),
                            comment: s.comment || '',
                            createdAt: s.createdAt || '',
                            createdBy: s.createdBy || '',
                            isDeleted: Boolean(s.isDeleted ?? false)
                        }
                    });
                }
            }

            // 5. Restore KpiRecords
            if (backup.kpiRecords && backup.kpiRecords.length > 0) {
                for (const k of backup.kpiRecords) {
                    await tx.kpiRecord.create({
                        data: {
                            id: k.id,
                            date: k.date,
                            employeeId: k.employeeId,
                            qualityScore: Number(k.qualityScore ?? 0),
                            errorsCount: Number(k.errorsCount ?? 0),
                            salesBonus: Number(k.salesBonus ?? 0),
                            checkList: Number(k.checkList ?? 0),
                            createdAt: k.createdAt || '',
                            createdBy: k.createdBy || ''
                        }
                    });
                }
            }

            // 6. Restore PromotionSales
            if (backup.promotionSales && backup.promotionSales.length > 0) {
                for (const p of backup.promotionSales) {
                    await tx.promotionSale.create({
                        data: {
                            id: p.id,
                            date: p.date,
                            employeeId: p.employeeId,
                            patientId: p.patientId || '',
                            productName: p.productName || p.description || 'Unknown Product',
                            price: Number(p.price ?? 0),
                            bonus: Number(p.bonus ?? p.amount ?? 0),
                            createdAt: p.createdAt || '',
                            createdBy: p.createdBy || ''
                        }
                    });
                }
            }

            // 7. Restore RegistrationKpis
            if (backup.registrationKpis && backup.registrationKpis.length > 0) {
                for (const r of backup.registrationKpis) {
                    await tx.registrationKpi.create({
                        data: {
                            id: r.id,
                            date: r.date,
                            employeeId: r.employeeId,
                            patientId: r.patientId || '',
                            criterion1: Number(r.criterion1 ?? 0),
                            criterion2: Number(r.criterion2 ?? 0),
                            criterion3: Number(r.criterion3 ?? 0),
                            totalScore: Number(r.totalScore ?? 0),
                            maxScore: Number(r.maxScore ?? 0),
                            count: Number(r.count ?? 0),
                            createdAt: r.createdAt || '',
                            createdBy: r.createdBy || ''
                        }
                    });
                }
            }

            // 8. Restore MonthlyChecklists
            if (backup.monthlyChecklists && backup.monthlyChecklists.length > 0) {
                for (const m of backup.monthlyChecklists) {
                    await tx.monthlyChecklist.create({
                        data: {
                            id: m.id,
                            month: m.month,
                            employeeId: m.employeeId,
                            percentage: Number(m.percentage ?? 0),
                            sickLeaveOpening: Number(m.sickLeaveOpening ?? 0),
                            sickLeaveClosing: Number(m.sickLeaveClosing ?? 0),
                            cardCreation: Number(m.cardCreation ?? 0),
                            closingBonus: Number(m.closingBonus ?? 0),
                            createdAt: m.createdAt || '',
                            updatedAt: m.updatedAt || '',
                            updatedBy: m.updatedBy || ''
                        }
                    });
                }
            }

            // 8.1 Restore DailyChecklists
            if (backup.dailyChecklists && backup.dailyChecklists.length > 0) {
                for (const d of backup.dailyChecklists) {
                    await tx.dailyChecklist.create({
                        data: {
                            id: d.id,
                            date: d.date,
                            employeeId: d.employeeId,
                            criterion1: Number(d.criterion1 ?? 0),
                            criterion2: Number(d.criterion2 ?? 0),
                            criterion3: Number(d.criterion3 ?? 0),
                            criterion4: Number(d.criterion4 ?? 0),
                            criterion5: Number(d.criterion5 ?? 0),
                            criterion6: Number(d.criterion6 ?? 0),
                            totalScore: Number(d.totalScore ?? 0),
                            maxScore: Number(d.maxScore ?? 100),
                            createdAt: d.createdAt || '',
                            createdBy: d.createdBy || ''
                        }
                    });
                }
            }

            // 8.2 Restore ClosedMonths
            if (backup.closedMonths && backup.closedMonths.length > 0) {
                for (const c of backup.closedMonths) {
                    await tx.closedMonth.create({
                        data: {
                            month: c.month,
                            isClosed: Boolean(c.isClosed),
                            createdAt: c.createdAt || '',
                            updatedAt: c.updatedAt || ''
                        }
                    });
                }
            }

            // 8.3 Restore Employee History
            if (backup.employeeRoleHistories && backup.employeeRoleHistories.length > 0) {
                for (const h of backup.employeeRoleHistories) {
                    await tx.employeeRoleHistory.create({
                        data: {
                            id: h.id,
                            employeeId: h.employeeId,
                            role: h.role || 'ADMIN',
                            seniorId: h.seniorId || null,
                            startDate: h.startDate,
                            endDate: h.endDate || null
                        }
                    });
                }
            }

            if (backup.employeeSalaryHistories && backup.employeeSalaryHistories.length > 0) {
                for (const h of backup.employeeSalaryHistories) {
                    await tx.employeeSalaryHistory.create({
                        data: {
                            id: h.id,
                            employeeId: h.employeeId,
                            baseSalary: Number(h.baseSalary ?? 0),
                            hourlyRate: Number(h.hourlyRate ?? 0),
                            startDate: h.startDate,
                            endDate: h.endDate || null
                        }
                    });
                }
            }
        }, { timeout: 60000 });

        // 9. Restore AuditLogs outside main transaction (Extreme Scalability: Mini-Transactions)
        if (backup.auditLogs && backup.auditLogs.length > 0) {
            console.log(`Starting audit log restoration: ${backup.auditLogs.length} records`);
            const MINI_BATCH = 200; // Small transactions are extremely fast in SQLite
            for (let i = 0; i < backup.auditLogs.length; i += MINI_BATCH) {
                const chunk = backup.auditLogs.slice(i, i + MINI_BATCH);
                await prisma.$transaction(async (mtx) => {
                    for (const l of chunk) {
                        await mtx.auditLog.create({
                            data: {
                                id: l.id,
                                entityType: l.entityType,
                                entityId: l.entityId,
                                action: l.action,
                                changedBy: l.changedBy,
                                changedByRole: l.changedByRole || 'ADMIN',
                                timestamp: l.timestamp,
                                details: l.details || ''
                            }
                        });
                    }
                });
                if (i % 1000 === 0) console.log(`Restored ${i} audit logs...`);
            }
            console.log('Audit logs restoration complete');
        }

        return NextResponse.json({ success: true, message: 'Database restored successfully' });
    } catch (error) {
        console.error('Restore Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Restore failed: ' + message }, { status: 500 });
    }
}

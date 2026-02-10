
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function restore() {
    try {
        const backupPath = path.join(process.cwd(), 'test-backup.json');
        if (!fs.existsSync(backupPath)) {
            console.error('Backup file not found:', backupPath);
            return;
        }

        const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

        console.log(`Found backup from ${data.timestamp}`);
        console.log(`Employees: ${data.employees.length}`);
        console.log(`Shifts: ${data.shifts?.length || 0}`);

        // Restore in transaction
        await prisma.$transaction(async (tx) => {
            // 1. Clear existing (which is empty anyway, but safer)
            await tx.auditLog.deleteMany({});
            await tx.promotionSale.deleteMany({});
            await tx.registrationKpi.deleteMany({});
            await tx.kpiRecord.deleteMany({});
            await tx.shift.deleteMany({});
            await tx.employee.deleteMany({});
            await tx.monthlyNorm.deleteMany({});

            console.log('Cleared existing data.');

            // 2. Restore Employees
            for (const emp of data.employees) {
                await tx.employee.create({
                    data: {
                        id: emp.id,
                        name: emp.name,
                        role: emp.role,
                        password: emp.password,
                        baseSalary: emp.baseSalary,
                        hourlyRate: emp.hourlyRate,
                        branch: emp.branch,
                        sortOrder: emp.sortOrder,
                        createdAt: emp.createdAt || new Date().toISOString()
                    }
                });
            }
            console.log('Restored Employees.');

            // 3. Restore Shifts
            if (data.shifts) {
                for (const s of data.shifts) {
                    await tx.shift.create({
                        data: {
                            id: s.id,
                            date: s.date,
                            employeeId: s.employeeId,
                            type: s.type || 'REGULAR',
                            hours: Number(s.hours ?? 0),
                            cabinetClosed: Boolean(s.cabinetClosed),
                            coefficient: Number(s.coefficient ?? 1.0),
                            comment: s.comment,
                            createdAt: s.createdAt || '',
                            createdBy: s.createdBy,
                            isDeleted: Boolean(s.isDeleted ?? false)
                        }
                    });
                }
            }
            console.log('Restored Shifts.');

            // 4. Restore KpiRecord
            if (data.kpiRecords) {
                for (const k of data.kpiRecords) {
                    await tx.kpiRecord.create({
                        data: {
                            id: k.id,
                            date: k.date,
                            employeeId: k.employeeId,
                            qualityScore: Number(k.qualityScore ?? 0),
                            errorsCount: Number(k.errorsCount ?? 0),
                            salesBonus: Number(k.salesBonus ?? 0),
                            checkList: Boolean(k.checkList),
                            createdAt: k.createdAt || '',
                            createdBy: k.createdBy
                        }
                    });
                }
                console.log('Restored KPI Records.');
            }

            // 5. Restore PromotionSale
            if (data.promotionSales) {
                for (const p of data.promotionSales) {
                    await tx.promotionSale.create({
                        data: {
                            id: p.id,
                            date: p.date,
                            employeeId: p.employeeId,
                            patientId: p.patientId,
                            productName: p.productName || p.description || 'Unknown Product',
                            price: Number(p.price ?? 0),
                            bonus: Number(p.bonus ?? p.amount ?? 0),
                            createdAt: p.createdAt || '',
                            createdBy: p.createdBy
                        }
                    });
                }
                console.log('Restored Promotion Sales.');
            }

            // 6. Restore RegistrationKpi
            if (data.registrationKpis) {
                for (const r of data.registrationKpis) {
                    await tx.registrationKpi.create({
                        data: {
                            id: r.id,
                            date: r.date,
                            employeeId: r.employeeId,
                            patientId: r.patientId,
                            criterion1: Number(r.criterion1 ?? 0),
                            criterion2: Number(r.criterion2 ?? 0),
                            criterion3: Number(r.criterion3 ?? 0),
                            totalScore: Number(r.totalScore ?? 0),
                            maxScore: Number(r.maxScore ?? 0),
                            createdAt: r.createdAt || '',
                            createdBy: r.createdBy
                        }
                    });
                }
                console.log('Restored Registration KPIs.');
            }

            // 7. Monthly Norm
            if (data.monthlyNorms) {
                for (const norm of data.monthlyNorms) {
                    await tx.monthlyNorm.upsert({
                        where: { month: norm.month },
                        update: { hours: Number(norm.hours ?? 176) },
                        create: {
                            month: norm.month,
                            hours: Number(norm.hours ?? 176),
                            createdAt: norm.createdAt || ''
                        }
                    });
                }
                console.log('Restored Monthly Norms.');
            }
        });

        console.log('Restore completed successfully.');
    } catch (e) {
        console.error('Restore failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

restore();

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const session = await getSession();
    if (!session || session.employee.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    try {
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            employees: await prisma.employee.findMany(),
            shifts: await prisma.shift.findMany(),
            kpiRecords: await prisma.kpiRecord.findMany(),
            monthlyNorms: await prisma.monthlyNorm.findMany(),
            promotionSales: await prisma.promotionSale.findMany(),
            registrationKpis: await prisma.registrationKpi.findMany(),
            monthlyChecklists: await prisma.monthlyChecklist.findMany(),
            auditLogs: await prisma.auditLog.findMany()
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

        // --- SAFETY SNAPSHOT BEFORE RESTORE ---
        const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');
        const SNAPSHOTS_DIR = path.join(process.cwd(), 'prisma', 'snapshots');
        if (fs.existsSync(DB_PATH)) {
            if (!fs.existsSync(SNAPSHOTS_DIR)) fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
            const safetyName = `auto_before_json_restore_${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
            fs.copyFileSync(DB_PATH, path.join(SNAPSHOTS_DIR, safetyName));
        }
        // --------------------------------------

        // Helper to chunk array
        const chunkArray = (arr: any[], size: number) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        };

        // Transactional Restore
        await prisma.$transaction(async (tx) => {
            // 1. Clear all tables in correct order
            await tx.auditLog.deleteMany();
            await tx.registrationKpi.deleteMany();
            await tx.promotionSale.deleteMany();
            await tx.kpiRecord.deleteMany();
            await tx.monthlyChecklist.deleteMany();
            await tx.shift.deleteMany();
            await tx.monthlyNorm.deleteMany();
            await tx.employee.deleteMany();

            const CHUNK_SIZE = 100; // Safe for SQLite (100 * ~10 fields = 1000 params)

            // 2. Restore Employees
            if (backup.employees.length > 0) {
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
                            sortOrder: Number(emp.sortOrder ?? 0),
                            createdAt: emp.createdAt || ''
                        }
                    });
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
            if (backup.shifts.length > 0) {
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
                            coefficient: Number(s.coefficient ?? 1.0),
                            comment: s.comment,
                            createdAt: s.createdAt || '',
                            createdBy: s.createdBy,
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
                            createdBy: k.createdBy
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
                            patientId: p.patientId,
                            productName: p.productName || p.description || 'Unknown Product',
                            price: Number(p.price ?? 0),
                            bonus: Number(p.bonus ?? p.amount ?? 0),
                            createdAt: p.createdAt || '',
                            createdBy: p.createdBy
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
                            patientId: r.patientId,
                            criterion1: Number(r.criterion1 ?? 0),
                            criterion2: Number(r.criterion2 ?? 0),
                            criterion3: Number(r.criterion3 ?? 0),
                            totalScore: Number(r.totalScore ?? 0),
                            maxScore: Number(r.maxScore ?? 0),
                            count: Number(r.count ?? 0),
                            createdAt: r.createdAt || '',
                            createdBy: r.createdBy
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
                            createdAt: m.createdAt || '',
                            updatedAt: m.updatedAt || '',
                            updatedBy: m.updatedBy
                        }
                    });
                }
            }

            // 9. Restore AuditLogs
            if (backup.auditLogs && backup.auditLogs.length > 0) {
                for (const l of backup.auditLogs) {
                    await tx.auditLog.create({
                        data: {
                            id: l.id,
                            entityType: l.entityType,
                            entityId: l.entityId,
                            action: l.action,
                            changedBy: l.changedBy,
                            changedByRole: l.changedByRole || 'ADMIN',
                            timestamp: l.timestamp,
                            details: l.details
                        }
                    });
                }
            }
        });

        return NextResponse.json({ success: true, message: 'Database restored successfully' });
    } catch (error: any) {
        console.error('Restore Error:', error);
        return NextResponse.json({ error: 'Restore failed: ' + error.message }, { status: 500 });
    }
}

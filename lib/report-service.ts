import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export class ReportService {
    static async generateExcel(date: string, type: string, employeeId?: string) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'HR Platform';
        workbook.created = new Date();

        const startDate = startOfMonth(parseISO(date));
        const endDate = endOfMonth(parseISO(date));
        const dateFilter = {
            gte: format(startDate, 'yyyy-MM-dd'),
            lte: format(endDate, 'yyyy-MM-dd')
        };
        const monthStr = format(startDate, 'yyyy-MM');

        const empFilter = employeeId ? { id: employeeId } : {};
        const employees = await prisma.employee.findMany({
            where: empFilter,
            orderBy: { sortOrder: 'asc' }
        });

        const normRecord = await prisma.monthlyNorm.findUnique({
            where: { month: monthStr }
        });
        const monthNorm = normRecord?.hours || 176;

        // Styles
        const headerStyle: Partial<ExcelJS.Style> = {
            font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }, // Indigo 600
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        };
        const cellStyle: Partial<ExcelJS.Style> = {
            border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
            alignment: { vertical: 'middle' }
        };

        const applyHeader = (sheet: ExcelJS.Worksheet) => {
            sheet.getRow(1).height = 30;
            sheet.getRow(1).eachCell((cell) => {
                cell.style = headerStyle;
            });
        };

        // 1. SCHEDULE SHEET
        // We need Shift Cost for formulas
        if (type === 'FULL' || type === 'SCHEDULE') {
            const sheet = workbook.addWorksheet('График');
            sheet.columns = [
                { header: 'Дата', key: 'date', width: 12, style: cellStyle },
                { header: 'Сотрудник', key: 'employee', width: 25, style: cellStyle },
                { header: 'Тип', key: 'type', width: 15, style: cellStyle },
                { header: 'Часы', key: 'hours', width: 10, style: cellStyle },
                { header: 'Коэф.', key: 'coeff', width: 10, style: cellStyle },
                { header: 'Ставка/ч', key: 'rate', width: 12, style: cellStyle }, // New
                { header: 'Сумма', key: 'cost', width: 12, style: cellStyle }, // New
                { header: 'Кабинеты', key: 'cabinet', width: 15, style: cellStyle },
                { header: 'Комментарий', key: 'comment', width: 30, style: cellStyle },
            ];

            const shifts = await prisma.shift.findMany({
                where: { date: dateFilter, employeeId: employeeId || undefined },
                include: { employee: true },
                orderBy: [{ date: 'asc' }, { employee: { sortOrder: 'asc' } }]
            });

            shifts.forEach(s => {
                let shiftCost = 0;
                let hourlyRate = 0;

                if (s.type === 'REGULAR') {
                    hourlyRate = (s.employee.baseSalary / monthNorm) * s.coefficient;
                    shiftCost = hourlyRate * s.hours;
                } else if (s.type === 'DAY_OFF_WORK') {
                    hourlyRate = 3500 / 11;
                    shiftCost = hourlyRate * s.hours;
                }

                sheet.addRow({
                    date: s.date,
                    employee: s.employee.name,
                    type: s.type === 'REGULAR' ? 'Смена' : s.type === 'SICK' ? 'Больничный' : s.type === 'VACATION' ? 'Отпуск' : 'Доп. смена',
                    hours: s.hours,
                    coeff: s.coefficient,
                    rate: hourlyRate,
                    cost: shiftCost,
                    cabinet: s.cabinetClosed ? 'Да (+250)' : 'Нет',
                    comment: s.comment || ''
                });
            });
            applyHeader(sheet);
        }

        // 2. SALES SHEET
        if (type === 'FULL' || type === 'SALES') {
            const sheet = workbook.addWorksheet('Продажи');
            sheet.columns = [
                { header: 'Дата', key: 'date', width: 12, style: cellStyle },
                { header: 'Сотрудник', key: 'employee', width: 25, style: cellStyle },
                { header: 'Пациент', key: 'patient', width: 25, style: cellStyle },
                { header: 'Товар', key: 'product', width: 30, style: cellStyle },
                { header: 'Цена', key: 'price', width: 12, style: cellStyle },
                { header: 'Бонус', key: 'bonus', width: 12, style: cellStyle },
            ];

            const sales = await prisma.promotionSale.findMany({
                where: { date: dateFilter, employeeId: employeeId || undefined },
                include: { employee: true },
                orderBy: { date: 'asc' }
            });

            sales.forEach(s => {
                sheet.addRow({
                    date: s.date,
                    employee: s.employee.name,
                    patient: s.patientId || '-',
                    product: s.productName,
                    price: s.price,
                    bonus: s.bonus
                });
            });
            applyHeader(sheet);
        }

        // 3. REGISTRATIONS SHEET
        if (type === 'FULL' || type === 'REGISTRATION') {
            const sheet = workbook.addWorksheet('Первички');
            sheet.columns = [
                { header: 'Дата', key: 'date', width: 12, style: cellStyle },
                { header: 'Сотрудник', key: 'employee', width: 25, style: cellStyle },
                { header: 'Пациент', key: 'patient', width: 25, style: cellStyle },
                { header: 'Критерий 1', key: 'c1', width: 10, style: cellStyle },
                { header: 'Критерий 2', key: 'c2', width: 10, style: cellStyle },
                { header: 'Критерий 3', key: 'c3', width: 10, style: cellStyle },
                { header: 'Итог', key: 'total', width: 10, style: cellStyle },
                { header: '%', key: 'percent', width: 10, style: cellStyle }, // New
            ];

            const regs = await prisma.registrationKpi.findMany({
                where: { date: dateFilter, employeeId: employeeId || undefined },
                include: { employee: true },
                orderBy: { date: 'asc' }
            });

            regs.forEach(r => {
                const percent = r.maxScore > 0 ? r.totalScore / r.maxScore : 0;
                sheet.addRow({
                    date: r.date,
                    employee: r.employee.name,
                    patient: r.patientId || '-',
                    c1: r.criterion1,
                    c2: r.criterion2,
                    c3: r.criterion3,
                    total: r.totalScore,
                    percent: percent
                });
            });
            applyHeader(sheet);
            sheet.getColumn('percent').numFmt = '0%';
        }

        // 4. KPI & SALARY SHEET (Calculated via Formulas)
        if (type === 'FULL' || type === 'KPI') {
            const sheet = workbook.addWorksheet('Зарплата');
            sheet.columns = [
                { header: 'Сотрудник', key: 'name', width: 25, style: cellStyle },
                { header: 'Оклад', key: 'base', width: 15, style: cellStyle },
                { header: 'Часы', key: 'hours', width: 15, style: cellStyle },
                { header: 'Смены (Руб)', key: 'shiftPay', width: 15, style: cellStyle },
                { header: 'Кабинеты', key: 'cabinets', width: 20, style: cellStyle },
                { header: 'Продажи', key: 'sales', width: 15, style: cellStyle },
                { header: 'Качество', key: 'quality', width: 15, style: cellStyle }, // New: Show avg %
                { header: 'KPI бонус', key: 'kpi', width: 15, style: cellStyle },
                { header: 'ИТОГО', key: 'total', width: 15, style: { ...cellStyle, font: { bold: true } } },
            ];

            // Legacy KPI Bonus fetch (if any) to add to Sales or KPI?
            // "Sales Bonus" in code included legacy KpiRecord.salesBonus.
            // "Quality" included legacy KpiRecord.qualityScore.
            // Using formulas makes mixing Legacy + New hard.
            // Assumption: We rely on New (Sheets based) data primarily.
            // If we want to include Legacy, we'd need a hidden sheet or explicit values.
            // For now, I will use FORMULAS for the new Referencing logic.
            // If `type !== FULL`, we can't reference sheets that don't exist!
            // CHECK: If type is 'KPI', do we generate other sheets?
            // The code above generates sheets if `type === FULL || type === ...`.
            // If user selects 'KPI', other sheets are NOT generated. Formulas will BREAK.
            // SOLUTION: If type is NOT FULL, we must fall back to VALUES.

            const useFormulas = type === 'FULL';

            // Re-fetch data for Values Fallback (or just use same logic as before if !useFormulas)
            const allShifts = await prisma.shift.findMany({ where: { date: dateFilter, employeeId: employeeId || undefined } });
            const allSales = await prisma.promotionSale.findMany({ where: { date: dateFilter, employeeId: employeeId || undefined } });
            const allKpi = await prisma.kpiRecord.findMany({ where: { date: dateFilter, employeeId: employeeId || undefined } }); // Legacy KPI
            const allRegs = await prisma.registrationKpi.findMany({ where: { date: dateFilter, employeeId: employeeId || undefined } });

            for (const emp of employees) {
                if (emp.role === 'MANAGER') continue;

                const rowNum = sheet.rowCount + 1;
                const empName = emp.name; // Assuming unique names or consistent naming

                if (useFormulas) {
                    // FORMULAS
                    // Hours: SUMIF('График'!B:B, name, 'График'!D:D)
                    // ShiftPay: SUMIF('График'!B:B, name, 'График'!G:G)  (Col 7 is G: Cost)
                    // Cabinets: COUNTIFS('График'!B:B, name, 'График'!H:H, "Да (+250)") * 250 (Col 8 is H)
                    // Sales: SUMIF('Продажи'!B:B, name, 'Продажи'!F:F) (Col 6 is F)
                    // Quality: AVERAGEIF('Первички'!B:B, name, 'Первички'!H:H) (Col 8 is H: %)
                    // KPI: IF(Quality >= 0.95, 5000, IF(Quality >= 0.90, 2500, 0))

                    sheet.addRow({
                        name: empName,
                        base: emp.baseSalary,
                        hours: { formula: `SUMIF('График'!B:B, A${rowNum}, 'График'!D:D)` },
                        shiftPay: { formula: `SUMIF('График'!B:B, A${rowNum}, 'График'!G:G)` },
                        cabinets: { formula: `COUNTIFS('График'!B:B, A${rowNum}, 'График'!H:H, "Да (+250)")*250` },
                        sales: { formula: `SUMIF('Продажи'!B:B, A${rowNum}, 'Продажи'!F:F)` },
                        quality: { formula: `IFERROR(AVERAGEIF('Первички'!B:B, A${rowNum}, 'Первички'!I:I), 0)` }, // Column I is %
                        kpi: { formula: `IF(G${rowNum}>=0.95, 5000, IF(G${rowNum}>=0.9, 2500, 0))` },
                        total: { formula: `D${rowNum} + E${rowNum} + F${rowNum} + H${rowNum}` } // Base (B) is NOT included? 
                        // Wait, Formula for Total Pay: Base + ShiftPay + Cabinets + Sales + KPI?
                        // Actually, ShiftPay usually INCLUDES Base calculation components (Hourly * Hours).
                        // In code: `basePay += hourlyBase * s.hours`.
                        // So `ShiftPay` (Col D) IS the salary for time worked.
                        // We DO NOT add `Base` (Col B) again. `Base` column is just for reference/calculation of rate.
                        // SO: Total = D + E + F + H.
                        // (Col D is ShiftPay, E is Cabinets, F is Sales, H is KPI).
                    });
                } else {
                    // FALLBACK TO VALUES (Simple logic from before)
                    // ... reuse previous logic ...
                    // For brevity in this edit, I'll essentially paste the logic from previous step, 
                    // but simplified or reused.
                    // Since I'm replacing the whole function, I need to include it.

                    const empShifts = allShifts.filter(s => s.employeeId === emp.id);
                    const empSales = allSales.filter(s => s.employeeId === emp.id);
                    const empRegs = allRegs.filter(r => r.employeeId === emp.id);
                    const empLegacyKpi = allKpi.filter(k => k.employeeId === emp.id);

                    let hoursWorked = 0;
                    let shiftPay = 0;
                    let cabinetBonuses = 0;
                    const hourlyBase = emp.baseSalary / monthNorm;

                    empShifts.forEach(s => {
                        if (s.type === 'REGULAR') {
                            hoursWorked += s.hours;
                            shiftPay += hourlyBase * s.hours * s.coefficient;
                        } else if (s.type === 'DAY_OFF_WORK') {
                            shiftPay += (3500 / 11) * s.hours;
                        }
                        if (s.cabinetClosed) cabinetBonuses += 250;
                    });

                    const salesBonus = empLegacyKpi.reduce((sum, k) => sum + k.salesBonus, 0) +
                        empSales.reduce((sum, s) => sum + s.bonus, 0);

                    // Quality
                    const regCount = empRegs.length;
                    let avgQuality = 0;
                    if (regCount > 0) {
                        avgQuality = (empRegs.reduce((sum, r) => sum + (r.totalScore / r.maxScore), 0) / regCount);
                    } else if (empLegacyKpi.length > 0) { // Fallback to legacy if no new registrations
                        avgQuality = empLegacyKpi.reduce((sum, k) => sum + k.qualityScore, 0) / empLegacyKpi.length / 100; // Legacy was 0-100
                    }

                    let kpiBonus = 0;
                    if (avgQuality >= 0.95) kpiBonus = 5000;
                    else if (avgQuality >= 0.90) kpiBonus = 2500;

                    sheet.addRow({
                        name: empName,
                        base: emp.baseSalary,
                        hours: hoursWorked,
                        shiftPay: shiftPay,
                        cabinets: cabinetBonuses,
                        sales: salesBonus,
                        quality: avgQuality,
                        kpi: kpiBonus,
                        total: shiftPay + cabinetBonuses + salesBonus + kpiBonus
                    });
                }
            }

            applyHeader(sheet);
            sheet.getColumn('quality').numFmt = '0%';
            sheet.getColumn('shiftPay').numFmt = '#,##0.00';
            sheet.getColumn('total').numFmt = '#,##0.00';
        }

        return workbook;
    }
}

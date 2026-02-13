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
        const daysInMonth = endDate.getDate();

        const dateFilter = {
            gte: format(startDate, 'yyyy-MM-dd'),
            lte: format(endDate, 'yyyy-MM-dd')
        };
        const monthStr = format(startDate, 'yyyy-MM'); // e.g. "2026-02"

        const empFilter: any = employeeId ? { id: employeeId } : { role: { not: 'MANAGER' } };
        const employees = await prisma.employee.findMany({
            where: empFilter,
            orderBy: { sortOrder: 'asc' }
        });

        // If specific employeeId was provided, double check it's not a MANAGER
        if (employeeId && employees.length > 0 && employees[0].role === 'MANAGER') {
            return workbook; // Return empty or handle as "no report for manager"
        }

        const normRecord = await prisma.monthlyNorm.findUnique({
            where: { month: monthStr }
        });
        const monthNorm = normRecord?.hours || 176;

        // Styles
        const headerStyle: Partial<ExcelJS.Style> = {
            font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        };
        const cellStyle: Partial<ExcelJS.Style> = {
            border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
            alignment: { vertical: 'middle' }
        };
        const centerStyle: Partial<ExcelJS.Style> = {
            ...cellStyle,
            alignment: { horizontal: 'center', vertical: 'middle' }
        };

        const applyHeader = (sheet: ExcelJS.Worksheet, rowIdx: number = 1) => {
            const row = sheet.getRow(rowIdx);
            row.height = 30;
            row.eachCell((cell) => {
                cell.style = headerStyle;
            });
        };

        // =============================================
        // 1. SCHEDULE SHEET (manual rows — mirrors UI)
        // =============================================
        if (type === 'FULL' || type === 'SCHEDULE') {
            const sheet = workbook.addWorksheet('График');

            // UI-matching fill colors
            const fillRegular: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }; // blue-100
            const fillDayOff: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // amber-100
            const fillSick: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // red-100
            const fillVacation: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; // green-100

            // Row 1: Month name in Russian (e.g. "Февраль")
            const monthName = format(startDate, 'LLLL', { locale: ru });
            sheet.getCell('A1').value = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            sheet.getCell('A1').font = { bold: true, size: 16 };

            // Row 2: Norm hours
            sheet.getCell('A2').value = `Норма часов: ${monthNorm}`;
            sheet.getCell('A2').font = { bold: true, size: 11 };

            // Row 3: spacer (empty)

            // Row 4: Table header — "Сотрудник" + day numbers
            sheet.getColumn(1).width = 25;
            const hdrRow = sheet.getRow(4);
            hdrRow.getCell(1).value = 'Сотрудник';
            hdrRow.getCell(1).style = headerStyle;
            for (let d = 1; d <= daysInMonth; d++) {
                const col = d + 1;
                sheet.getColumn(col).width = 5;
                hdrRow.getCell(col).value = d;
                hdrRow.getCell(col).style = headerStyle;
            }
            hdrRow.height = 24;

            // Fetch ONLY active (non-deleted) shifts
            const shifts = await prisma.shift.findMany({
                where: {
                    date: dateFilter,
                    isDeleted: false,
                    employee: employeeId ? { id: employeeId } : { role: { not: 'MANAGER' } },
                },
                include: { employee: true },
            });

            // Pre-index shifts by "employeeId|date" for O(1) lookup
            const shiftMap = new Map<string, typeof shifts[0]>();
            for (const s of shifts) {
                // IMPORTANT: Normalize date string from DB (it might contain T00:00:00)
                const normalizedDate = s.date.substring(0, 10);
                const key = `${s.employeeId}|${normalizedDate}`;
                shiftMap.set(key, s);
            }

            // Fill employee rows (starting at row 5)
            const reportEmployees = employees.filter(e => e.role !== 'MANAGER');
            let rowIdx = 5;

            for (const emp of reportEmployees) {
                // If specific employee, we want 3 rows: Hours, Coefficient, Cabinet
                const useMultiRow = !!employeeId;
                const rows = useMultiRow ? [
                    sheet.getRow(rowIdx),
                    sheet.getRow(rowIdx + 1),
                    sheet.getRow(rowIdx + 2),
                    sheet.getRow(rowIdx + 3)
                ] : [sheet.getRow(rowIdx)];

                const mainRow = rows[0];

                // Column A labels
                mainRow.getCell(1).value = emp.name;
                mainRow.getCell(1).style = cellStyle;
                mainRow.getCell(1).font = { bold: true };

                if (useMultiRow) {
                    rows[1].getCell(1).value = 'Коэф.';
                    rows[1].getCell(1).style = { ...cellStyle, font: { italic: true, size: 9, color: { argb: 'FF6B7280' } } };
                    rows[2].getCell(1).value = 'Кабинет';
                    rows[2].getCell(1).style = { ...cellStyle, font: { italic: true, size: 9, color: { argb: 'FF6B7280' } } };
                    rows[3] = sheet.getRow(rowIdx + 3);
                    rows[3].getCell(1).value = 'Центр';
                    rows[3].getCell(1).style = { ...cellStyle, font: { italic: true, size: 9, color: { argb: 'FF059669' } } };
                }

                // Day columns
                for (let d = 1; d <= daysInMonth; d++) {
                    const col = d + 1;
                    const dayStr = `${monthStr}-${String(d).padStart(2, '0')}`; // Results in YYYY-MM-DD
                    const shift = shiftMap.get(`${emp.id}|${dayStr}`);

                    // Initialize styling for all rows in this set
                    rows.forEach(r => {
                        const cell = r.getCell(col);
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        if (cellStyle.border) cell.border = cellStyle.border;
                    });

                    if (shift) {
                        const cell = mainRow.getCell(col);
                        if (shift.type === 'REGULAR') {
                            cell.value = shift.hours;
                            cell.fill = fillRegular;
                            cell.font = { bold: true, color: { argb: 'FF1E3A5F' } };
                        } else if (shift.type === 'DAY_OFF_WORK') {
                            cell.value = shift.hours;
                            cell.fill = fillDayOff;
                            cell.font = { bold: true, color: { argb: 'FF78350F' } };
                        } else if (shift.type === 'SICK') {
                            cell.value = 'Б';
                            cell.fill = fillSick;
                            cell.font = { bold: true, color: { argb: 'FF7F1D1D' } };
                        } else if (shift.type === 'VACATION') {
                            cell.value = 'О';
                            cell.fill = fillVacation;
                            cell.font = { bold: true, color: { argb: 'FF064E3B' } };
                        }

                        // Fill additional rows if in multi-row mode
                        if (useMultiRow) {
                            rows[1].getCell(col).value = shift.coefficient;
                            rows[1].getCell(col).font = { size: 9 };

                            if (shift.cabinetClosed) {
                                rows[2].getCell(col).value = 'Да';
                                rows[2].getCell(col).font = { size: 9, bold: true, color: { argb: 'FF059669' } };
                            }
                            if (shift.centerClosed) {
                                rows[3].getCell(col).value = 'Да';
                                rows[3].getCell(col).font = { size: 9, bold: true, color: { argb: 'FF059669' } };
                            }
                        }
                    }
                }

                rows.forEach((r, idx) => {
                    r.height = idx === 0 ? 22 : 18;
                });
                rowIdx += rows.length;
            }
        }

        // =============================================
        // 2. SALES SHEET
        // =============================================
        if (type === 'FULL' || type === 'SALES') {
            const sheet = workbook.addWorksheet('Продажи');
            sheet.columns = [
                { header: 'Дата', key: 'date', width: 12, style: { ...cellStyle, numFmt: 'dd.mm.yy' } },
                { header: 'Пациент', key: 'patient', width: 25, style: cellStyle },
                { header: 'Сотрудник', key: 'employee', width: 25, style: cellStyle },
                { header: 'Товар', key: 'product', width: 30, style: cellStyle },
                { header: 'Цена', key: 'price', width: 12, style: { ...cellStyle, numFmt: '#,##0' } },
                { header: 'Бонус', key: 'bonus', width: 12, style: { ...cellStyle, numFmt: '#,##0' } },
            ];

            const sales = await prisma.promotionSale.findMany({
                where: {
                    date: dateFilter,
                    employee: employeeId ? { id: employeeId } : { role: { not: 'MANAGER' } }
                },
                include: { employee: true },
                orderBy: { date: 'asc' }
            });

            sales.forEach(s => {
                sheet.addRow({
                    date: parseISO(s.date),
                    patient: s.patientId || '-',
                    employee: s.employee.name,
                    product: s.productName,
                    price: s.price,
                    bonus: s.bonus
                });
            });
            applyHeader(sheet);
        }

        // =============================================
        // 3. REGISTRATIONS SHEET
        // =============================================
        if (type === 'FULL' || type === 'REGISTRATION') {
            const sheet = workbook.addWorksheet('Первички');
            sheet.columns = [
                { header: 'Дата', key: 'date', width: 12, style: { ...cellStyle, numFmt: 'dd.mm.yy' } },
                { header: 'Пациент', key: 'patient', width: 25, style: cellStyle },
                { header: 'Сотрудник', key: 'employee', width: 25, style: cellStyle },
                { header: 'Критерий 1', key: 'c1', width: 10, style: centerStyle },
                { header: 'Критерий 2', key: 'c2', width: 10, style: centerStyle },
                { header: 'Критерий 3', key: 'c3', width: 10, style: centerStyle },
                { header: 'Итог', key: 'total', width: 10, style: centerStyle },
                { header: '%', key: 'percent', width: 10, style: { ...centerStyle, numFmt: '0.0%' } },
            ];

            const regs = await prisma.registrationKpi.findMany({
                where: {
                    date: dateFilter,
                    employee: employeeId ? { id: employeeId } : { role: { not: 'MANAGER' } }
                },
                include: { employee: true },
                orderBy: { date: 'asc' }
            });

            regs.forEach(r => {
                const percent = r.maxScore > 0 ? r.totalScore / r.maxScore : 0;
                sheet.addRow({
                    date: parseISO(r.date),
                    patient: r.patientId || '-',
                    employee: r.employee.name,
                    c1: r.criterion1,
                    c2: r.criterion2,
                    c3: r.criterion3,
                    total: r.totalScore,
                    percent: percent
                });
            });
            applyHeader(sheet);
        }

        // =============================================
        // 4. KPI & SALARY SHEET
        // =============================================
        if (type === 'FULL' || type === 'KPI') {
            const sheet = workbook.addWorksheet('Зарплата');
            sheet.columns = [
                { header: 'Сотрудник', key: 'name', width: 25, style: cellStyle },
                { header: 'Оклад', key: 'base', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                { header: 'Часы', key: 'hours', width: 12, style: { ...cellStyle, numFmt: '0.0' } },
                { header: 'Смены (Руб)', key: 'shiftPay', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                { header: 'Откр/Закр', key: 'closing', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                { header: 'Продажи', key: 'sales', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                { header: 'Чеклист %', key: 'checklist_pct', width: 15, style: { ...centerStyle, numFmt: '0.0%' } },
                { header: 'Чеклист Руб', key: 'checklist_rub', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                { header: 'Качество', key: 'quality', width: 15, style: { ...centerStyle, numFmt: '0.0%' } },
                { header: 'KPI бонус', key: 'kpi', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                { header: 'ИТОГО', key: 'total', width: 15, style: { ...cellStyle, font: { bold: true }, numFmt: '#,##0' } },
            ];

            const allShifts = await prisma.shift.findMany({
                where: { date: dateFilter, isDeleted: false, ...(employeeId ? { employeeId } : {}) }
            });
            const allSales = await prisma.promotionSale.findMany({ where: { date: dateFilter, employeeId: employeeId || undefined } });
            const allKpi = await prisma.kpiRecord.findMany({ where: { date: dateFilter, employeeId: employeeId || undefined } });
            const allRegs = await prisma.registrationKpi.findMany({ where: { date: dateFilter, employeeId: employeeId || undefined } });

            // Fetch monthly checklists
            const allChecklists = await prisma.monthlyChecklist.findMany({
                where: { month: monthStr, ...(employeeId ? { employeeId } : {}) }
            });

            for (const emp of employees) {
                if (emp.role === 'MANAGER') continue;

                const empShifts = allShifts.filter(s => s.employeeId === emp.id);
                const empSales = allSales.filter(s => s.employeeId === emp.id);
                const empRegs = allRegs.filter(r => r.employeeId === emp.id);
                const empLegacyKpi = allKpi.filter(k => k.employeeId === emp.id);

                let hoursWorked = 0;
                let shiftPay = 0;
                let closingBonuses = 0;
                const hourlyBase = emp.baseSalary / monthNorm;

                empShifts.forEach(s => {
                    if (s.type === 'REGULAR') {
                        hoursWorked += s.hours;
                        shiftPay += hourlyBase * s.hours * s.coefficient;
                    } else if (s.type === 'DAY_OFF_WORK') {
                        shiftPay += (3500 / 11) * s.hours;
                    }
                    if (s.cabinetClosed) closingBonuses += 250;
                    if (s.centerClosed) closingBonuses += 500;
                });

                const salesBonus = empLegacyKpi.reduce((sum, k) => sum + k.salesBonus, 0) +
                    empSales.reduce((sum, s) => sum + s.bonus, 0);

                const regCount = empRegs.length;
                let avgQuality = 0;
                if (regCount > 0) {
                    avgQuality = (empRegs.reduce((sum, r) => sum + (r.totalScore / r.maxScore), 0) / regCount);
                } else if (empLegacyKpi.length > 0) {
                    avgQuality = empLegacyKpi.reduce((sum, k) => sum + k.qualityScore, 0) / empLegacyKpi.length / 100;
                } else {
                    avgQuality = 1; // Default 100%
                }

                // Get checklist from monthly checklist table (single value per month)
                const empChecklist = allChecklists.find(c => c.employeeId === emp.id);
                const calcChecklist = empChecklist ? empChecklist.percentage / 100 : 0;

                let kpiBonus = 0;
                if (avgQuality >= 0.95) kpiBonus = 5000;
                else if (avgQuality >= 0.85) kpiBonus = 2500;

                let checklistBonus = 0;
                if (calcChecklist >= 0.90) checklistBonus = 5000;
                else if (calcChecklist >= 0.76) checklistBonus = 2500;

                sheet.addRow({
                    name: emp.name,
                    base: emp.baseSalary,
                    hours: hoursWorked,
                    shiftPay: Math.round(shiftPay),
                    closing: closingBonuses,
                    sales: salesBonus,
                    checklist_pct: calcChecklist,
                    checklist_rub: checklistBonus,
                    quality: avgQuality,
                    kpi: kpiBonus,
                    total: Math.round(shiftPay + closingBonuses + salesBonus + kpiBonus + checklistBonus)
                });
            }

            applyHeader(sheet);
        }

        return workbook;
    }
}

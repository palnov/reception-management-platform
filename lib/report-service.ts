import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import JSZip from 'jszip';
import type { Prisma, RegistrationKpi } from '@prisma/client';
import { shouldIncludeActingLeadBonus } from '@/lib/acting-lead-policy';
import { buildDetailizationWorkbook } from '@/lib/report-detailization';
import { calculateSeniorityBonus, getEmployeeRoleLabel } from '@/lib/employee-roles';

type EmployeeWithSalaryHistory = Prisma.EmployeeGetPayload<{
    include: { salaryHistory: true };
}>;

type RegistrationCriterionKey = 'criterion1' | 'criterion2' | 'criterion3';

function getRegistrationCriterion(record: RegistrationKpi, key: RegistrationCriterionKey) {
    return Number(record[key]) || 0;
}

export class ReportService {
    static async generateExcel(date: string, type: string, employeeId?: string) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'HR Platform';
        workbook.created = new Date();

        const startDate = startOfMonth(parseISO(date));
        let endDate = endOfMonth(parseISO(date));

        if (type === 'ACCOUNTANT_15') {
            endDate = new Date(startDate);
            endDate.setDate(15);
        }

        const daysInMonth = endDate.getDate();

        const dateFilter = {
            gte: format(startDate, 'yyyy-MM-dd'),
            lte: format(endDate, 'yyyy-MM-dd')
        };
        const monthStr = format(startDate, 'yyyy-MM'); // e.g. "2026-02"
        const includeActingLeadBonus = shouldIncludeActingLeadBonus(startDate);

        const empFilter: Prisma.EmployeeWhereInput = employeeId ? { id: employeeId } : {
            role: { not: 'MANAGER' },
            AND: [
                {
                    OR: [
                        { dismissalDate: "" },
                        { dismissalDate: { gte: format(startDate, 'yyyy-MM-dd') } }
                    ]
                },
                {
                    OR: [
                        { hireDate: "" },
                        { hireDate: { lte: format(endDate, 'yyyy-MM-dd') } }
                    ]
                }
            ]
        };
        const employees = await prisma.employee.findMany({
            where: empFilter,
            orderBy: { sortOrder: 'asc' },
            include: {
                salaryHistory: {
                    where: {
                        startDate: { lte: format(endDate, 'yyyy-MM-dd') },
                        OR: [
                            { endDate: null },
                            { endDate: { gte: format(startDate, 'yyyy-MM-dd') } }
                        ]
                    },
                    orderBy: { startDate: 'desc' },
                    take: 1
                }
            }
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
        const borderStyle: Partial<ExcelJS.Borders> = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        const headerStyle: Partial<ExcelJS.Style> = {
            font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: borderStyle
        };
        const cellStyle: Partial<ExcelJS.Style> = {
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
                // Tag ' (Уволен)' if employee is dismissed within or before this month
                const isDismissed = emp.dismissalDate && emp.dismissalDate !== "" && emp.dismissalDate <= format(endDate, 'yyyy-MM-dd');
                mainRow.getCell(1).value = emp.name + (isDismissed ? ' (Уволен)' : '');
                mainRow.getCell(1).style = cellStyle;
                mainRow.getCell(1).font = { bold: true, color: isDismissed ? { argb: 'FF9CA3AF' } : { argb: 'FF000000' } };

                if (useMultiRow) {
                    rows[1].getCell(1).value = 'Коэф.';
                    rows[1].getCell(1).style = { ...cellStyle, font: { italic: true, size: 9, color: { argb: 'FF6B7280' } } };
                    rows[2].getCell(1).value = 'Кабинет';
                    rows[2].getCell(1).style = { ...cellStyle, font: { italic: true, size: 9, color: { argb: 'FF6B7280' } } };
                    rows[3] = sheet.getRow(rowIdx + 3);
                    rows[3].getCell(1).value = 'Центр';
                    rows[3].getCell(1).style = { ...cellStyle, font: { italic: true, size: 9, color: { argb: 'FF059669' } } };
                }

                // Apply borders to the labels column and all day columns
                rows.forEach(r => {
                    for (let c = 1; c <= daysInMonth + 1; c++) {
                        r.getCell(c).border = borderStyle;
                    }
                });

                // Day columns
                for (let d = 1; d <= daysInMonth; d++) {
                    const col = d + 1;
                    const dayStr = `${monthStr}-${String(d).padStart(2, '0')}`; // Results in YYYY-MM-DD

                    // Safety check: skip logic for shifts before hire or after dismissal
                    const isBeforeHire = emp.hireDate && emp.hireDate !== "" && dayStr < emp.hireDate;
                    const isAfterDismissal = emp.dismissalDate && emp.dismissalDate !== "" && dayStr >= emp.dismissalDate;

                    if (isBeforeHire || isAfterDismissal) {
                        rows.forEach(r => {
                            const cell = r.getCell(col);
                            cell.style = cellStyle;
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }; // gray-100
                        });
                        continue;
                    }

                    const shift = shiftMap.get(`${emp.id}|${dayStr}`);

                    // Initialize styling for all rows in this set
                    rows.forEach(r => {
                        const cell = r.getCell(col);
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    });

                    if (shift) {
                        const cell = mainRow.getCell(col);
                        if (shift.type === 'REGULAR') {
                            cell.value = shift.hours;
                            cell.fill = fillRegular;
                            cell.font = { bold: true, color: { argb: 'FF1E3A5F' } };
                        } else if (shift.type === 'ARCHIVE_WORK') {
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
                const row = sheet.addRow({
                    date: parseISO(s.date),
                    patient: s.patientId || '-',
                    employee: s.employee.name,
                    product: s.productName,
                    price: s.price,
                    bonus: s.bonus
                });
                row.eachCell((cell) => { cell.border = borderStyle; });
            });
            applyHeader(sheet);
        }

        // =============================================
        // 3. REGISTRATIONS SHEET
        // =============================================
        if (type === 'FULL' || type === 'REGISTRATION') {
            const sheet = workbook.addWorksheet('Качество оформления');
            sheet.columns = [
                { header: 'Дата', key: 'date', width: 12, style: { ...cellStyle, numFmt: 'dd.mm.yy' } },
                { header: 'Сотрудник', key: 'employee', width: 25, style: cellStyle },
                { header: 'Кол-во оформлений', key: 'count', width: 15, style: centerStyle },
                { header: 'Факт', key: 'fact', width: 10, style: centerStyle },
                { header: 'Макс', key: 'max', width: 10, style: centerStyle },
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
                const maxScore = r.count * 3;
                const percent = maxScore > 0 ? r.totalScore / maxScore : 0;
                const row = sheet.addRow({
                    date: parseISO(r.date),
                    employee: r.employee.name,
                    count: r.count,
                    fact: r.totalScore,
                    max: maxScore,
                    percent: percent
                });
                row.eachCell((cell) => { cell.border = borderStyle; });
            });
            applyHeader(sheet);
        }

        // =============================================
        // 4. KPI & SALARY SHEET
        // =============================================
        if (type === 'FULL' || type === 'KPI' || type === 'ACCOUNTANT' || type === 'ACCOUNTANT_15') {
            const salarySheet = (type === 'FULL' || type === 'KPI') ? workbook.addWorksheet('Зарплата') : null;
            const accountantSheet = (type === 'FULL' || type === 'ACCOUNTANT') ? workbook.addWorksheet('Для бухгалтера') : null;
            const accountant15Sheet = (type === 'ACCOUNTANT_15') ? workbook.addWorksheet('Бухгалтерия (1-15)') : null;

            if (salarySheet) {
                const salaryCols = [
                    { header: 'Сотрудник', key: 'name', width: 25, style: cellStyle },
                    { header: 'Оклад', key: 'base', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                    { header: 'Часы', key: 'hours', width: 12, style: { ...cellStyle, numFmt: '0.0' } },
                    { header: 'Смены (Руб)', key: 'shiftPay', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                    { header: 'Работа в арх.', key: 'dayOffPay', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                    { header: 'Откр/Закр', key: 'closing', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                ];

                if (includeActingLeadBonus) {
                    salaryCols.push({ header: 'ИО', key: 'actingLead', width: 12, style: { ...cellStyle, numFmt: '#,##0' } });
                }
                salaryCols.push({ header: 'Стажёр', key: 'trainee', width: 12, style: { ...cellStyle, numFmt: '#,##0' } });

                salaryCols.push(
                    { header: 'Продажи', key: 'sales', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                    { header: 'Открытие Б/Л', key: 'sick_leave_open', width: 15, style: centerStyle },
                    { header: 'Закрытие/продление Б/Л', key: 'sick_leave_close', width: 25, style: centerStyle },
                    { header: 'Карточки', key: 'cards', width: 15, style: centerStyle },
                    { header: 'Выслуга', key: 'seniority', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                    { header: 'Чеклист %', key: 'checklist_pct', width: 15, style: { ...centerStyle, numFmt: '0.0%' } },
                    { header: 'Чеклист Руб', key: 'checklist_rub', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                    { header: 'Качество', key: 'quality', width: 15, style: { ...centerStyle, numFmt: '0.0%' } },
                    { header: 'KPI бонус', key: 'kpi', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                    { header: 'ИТОГО', key: 'total', width: 15, style: { ...cellStyle, font: { bold: true }, numFmt: '#,##0' } },
                );
                salarySheet.columns = salaryCols;
            }

            // UI-matching fill colors for accountant daily schedule
            const fillRegular: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }; // blue-100
            const fillDayOff: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // amber-100
            const fillSick: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // red-100
            const fillVacation: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; // green-100

            if (accountantSheet) {
                // Row 1: Month name in Russian
                const monthName = format(startDate, 'LLLL', { locale: ru });
                accountantSheet.getCell('A1').value = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                accountantSheet.getCell('A1').font = { bold: true, size: 16 };

                // Row 2: Norm hours
                accountantSheet.getCell('A2').value = `Норма часов: ${monthNorm}`;
                accountantSheet.getCell('A2').font = { bold: true, size: 11 };

                // Row 4: Header
                accountantSheet.getColumn(1).width = 25;
                const hdrRow = accountantSheet.getRow(4);
                hdrRow.getCell(1).value = 'Сотрудник';
                hdrRow.getCell(1).style = headerStyle;

                for (let d = 1; d <= daysInMonth; d++) {
                    const col = d + 1;
                    accountantSheet.getColumn(col).width = 5;
                    hdrRow.getCell(col).value = d;
                    hdrRow.getCell(col).style = headerStyle;
                }

                // Add accountant extra columns
                const extraCols = [
                    { name: 'Часы', width: 12 },
                    { name: 'Оклад', width: 15 },
                    { name: 'Надбавки', width: 15 },
                    { name: 'ИТОГО', width: 15 }
                ];
                extraCols.forEach((colInfo, idx) => {
                    const col = daysInMonth + 2 + idx;
                    accountantSheet.getColumn(col).width = colInfo.width;
                    const cell = hdrRow.getCell(col);
                    cell.value = colInfo.name;
                    cell.style = headerStyle;
                });
                hdrRow.height = 24;
            }

            if (accountant15Sheet) {
                // Row 1: Month name in Russian
                const monthName = format(startDate, 'LLLL', { locale: ru });
                accountant15Sheet.getCell('A1').value = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                accountant15Sheet.getCell('A1').font = { bold: true, size: 16 };

                // Row 2: Norm hours
                accountant15Sheet.getCell('A2').value = `Норма часов: ${monthNorm}`;
                accountant15Sheet.getCell('A2').font = { bold: true, size: 11 };

                // Row 4: Header
                accountant15Sheet.getColumn(1).width = 25;
                const hdrRow = accountant15Sheet.getRow(4);
                hdrRow.getCell(1).value = 'Сотрудник';
                hdrRow.getCell(1).style = headerStyle;

                for (let d = 1; d <= daysInMonth; d++) {
                    const col = d + 1;
                    accountant15Sheet.getColumn(col).width = 5;
                    hdrRow.getCell(col).value = d;
                    hdrRow.getCell(col).style = headerStyle;
                }

                // Add accountant extra columns
                const extraCols = [
                    { name: 'Часы', width: 12 },
                    { name: 'Оклад', width: 15 }
                ];
                extraCols.forEach((colInfo, idx) => {
                    const col = daysInMonth + 2 + idx;
                    accountant15Sheet.getColumn(col).width = colInfo.width;
                    const cell = hdrRow.getCell(col);
                    cell.value = colInfo.name;
                    cell.style = headerStyle;
                });
                hdrRow.height = 24;
            }

            const allShifts = await prisma.shift.findMany({
                where: { date: dateFilter, isDeleted: false, ...(employeeId ? { employeeId } : {}) }
            });
            const allSales = await prisma.promotionSale.findMany({ where: { date: dateFilter, employeeId: employeeId || undefined } });

            // For registrations and KPI records, we need ALL of them to calculate team averages for Seniors
            const allKpi = await prisma.kpiRecord.findMany({ where: { date: dateFilter } });
            const allRegs = await prisma.registrationKpi.findMany({ where: { date: dateFilter } });

            // Fetch monthly checklists
            const allChecklists = await prisma.monthlyChecklist.findMany({
                where: { month: monthStr }
            });
            const allDailyChecklists = await prisma.dailyChecklist.findMany({
                where: { date: dateFilter }
            });

            // Pre-index shifts by employeeId|date for O(1) lookup
            const shiftMap = new Map<string, typeof allShifts[0]>();
            for (const s of allShifts) {
                const normalizedDate = s.date.substring(0, 10);
                const key = `${s.employeeId}|${normalizedDate}`;
                shiftMap.set(key, s);
            }

            let accRowIdx = 5;
            let acc15RowIdx = 5;

            for (const emp of employees as EmployeeWithSalaryHistory[]) {
                if (emp.role === 'MANAGER') continue;

                const empShifts = allShifts.filter(s => s.employeeId === emp.id);
                const empSales = allSales.filter(s => s.employeeId === emp.id);
                const empLegacyKpi = allKpi.filter(k => k.employeeId === emp.id);

                let hoursWorked = 0;
                let shiftPay = 0;
                let dayOffPayTotal = 0;
                let closingBonuses = 0;
                let actingLeadBonus = 0;
                let traineeBonus = 0;
                
                // Use historical salary if available
                const effectiveBaseSalary = emp.salaryHistory?.[0]?.baseSalary ?? emp.baseSalary;
                const hourlyBase = effectiveBaseSalary / monthNorm;

                empShifts.forEach(s => {
                    if (s.type === 'REGULAR') {
                        hoursWorked += s.hours;
                        shiftPay += hourlyBase * s.hours * s.coefficient;
                    } else if (s.type === 'ARCHIVE_WORK') {
                        dayOffPayTotal += (3500 / 11) * s.hours;
                    }
                    if (s.cabinetClosed) closingBonuses += 250;
                    if (s.centerClosed) closingBonuses += 500;
                    if (s.isActingLead && includeActingLeadBonus) actingLeadBonus += 250;
                    if (s.isTrainee) traineeBonus += 500;
                });

                const salesBonus = empLegacyKpi.reduce((sum, k) => sum + k.salesBonus, 0) +
                    empSales.reduce((sum, s) => sum + s.bonus, 0);

                // New quality calculation logic for report service
                const getIndividualQuality = (e: EmployeeWithSalaryHistory) => {
                    const empRegs = allRegs.filter(r => r.employeeId === e.id);
                    const empLegacyKpi = allKpi.filter(k => k.employeeId === e.id);

                    if (empRegs.length > 0) {
                        const totalScore = empRegs.reduce((sum, r) => sum + r.totalScore, 0);
                        const totalMax = empRegs.reduce((sum, r) => sum + (r.maxScore || (r.count * 3) || 1), 0);
                        return totalMax > 0 ? (totalScore / totalMax) : 1;
                    } else if (empLegacyKpi.length > 0) {
                        return (empLegacyKpi.reduce((sum, k) => sum + k.qualityScore, 0) / empLegacyKpi.length) / 100;
                    } else {
                        return 1; // Default 100%
                    }
                };

                const ownQuality = getIndividualQuality(emp);
                const finalQuality = ownQuality;

                // Restore missing checklist/manual bonus variables
                const empChecklist = allChecklists.find(c => c.employeeId === emp.id);
                const empDailyChecklists = allDailyChecklists.filter(c => c.employeeId === emp.id);
                const avgDailyChecklist = empDailyChecklists.length > 0
                    ? (empDailyChecklists.reduce((sum, c) => sum + c.totalScore, 0) / empDailyChecklists.length) / 100
                    : 0;
                const ownChecklist = empChecklist ? empChecklist.percentage / 100 : 0;
                const sickLeaveOpening = empChecklist ? (empChecklist.sickLeaveOpening || 0) : 0;
                const sickLeaveClosing = empChecklist ? (empChecklist.sickLeaveClosing || 0) : 0;
                const cardCreation = empChecklist ? (empChecklist.cardCreation || 0) : 0;
                const calcChecklist = empDailyChecklists.length > 0 ? avgDailyChecklist : ownChecklist;

                const sickLeaveBonus = (sickLeaveOpening * 130) + (sickLeaveClosing * 80);
                const cardBonus = cardCreation * 60;

                let kpiBonus = 0;
                if (finalQuality >= 0.95) kpiBonus = 5000;
                else if (finalQuality >= 0.85) kpiBonus = 2500;

                let checklistBonus = 0;
                if (calcChecklist >= 0.90) checklistBonus = 5000;
                else if (calcChecklist >= 0.76) checklistBonus = 2500;

                if (monthStr >= '2026-05') {
                    const coeff = Math.min(1.0, Math.round((hoursWorked / monthNorm) * 100) / 100);
                    checklistBonus = Math.round(checklistBonus * coeff);
                    kpiBonus = Math.round(kpiBonus * coeff);
                }

                const seniority = calculateSeniorityBonus(emp, effectiveBaseSalary);
                const seniorityBonus = seniority.bonus;

                const baseShiftPay = Math.round(hourlyBase * hoursWorked);
                const bonuses = Math.round(dayOffPayTotal + closingBonuses + actingLeadBonus + traineeBonus + salesBonus + kpiBonus + checklistBonus + seniorityBonus + sickLeaveBonus + cardBonus);
                const total = Math.round(shiftPay + bonuses);
                const totalBonuses = total - baseShiftPay;

                if (salarySheet) {
                    const row = salarySheet.addRow({
                        name: emp.name,
                        base: effectiveBaseSalary,
                        hours: hoursWorked,
                        shiftPay: Math.round(shiftPay),
                        dayOffPay: Math.round(dayOffPayTotal),
                        closing: closingBonuses,
                        actingLead: actingLeadBonus,
                        trainee: traineeBonus,
                        sales: salesBonus,
                        sick_leave_open: sickLeaveOpening,
                        sick_leave_close: sickLeaveClosing,
                        cards: cardCreation,
                        seniority: seniorityBonus,
                        checklist_pct: calcChecklist,
                        checklist_rub: checklistBonus,
                        quality: finalQuality,
                        kpi: kpiBonus,
                        total: total
                    });
                    row.eachCell((cell) => { cell.border = borderStyle; });
                }

                const writeShiftsToSheet = (sheet: ExcelJS.Worksheet, rowNum: number) => {
                    const isDismissed = emp.dismissalDate && emp.dismissalDate !== "" && emp.dismissalDate <= format(endDate, 'yyyy-MM-dd');
                    const mainRow = sheet.getRow(rowNum);

                    // A: name
                    mainRow.getCell(1).value = emp.name + (isDismissed ? ' (Уволен)' : '');
                    mainRow.getCell(1).style = cellStyle;
                    mainRow.getCell(1).font = { bold: true, color: isDismissed ? { argb: 'FF9CA3AF' } : { argb: 'FF000000' } };

                    // Day columns
                    for (let d = 1; d <= daysInMonth; d++) {
                        const col = d + 1;
                        const dayStr = `${monthStr}-${String(d).padStart(2, '0')}`;

                        const isBeforeHire = emp.hireDate && emp.hireDate !== "" && dayStr < emp.hireDate;
                        const isAfterDismissal = emp.dismissalDate && emp.dismissalDate !== "" && dayStr >= emp.dismissalDate;

                        const cell = mainRow.getCell(col);
                        cell.border = borderStyle;
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };

                        if (isBeforeHire || isAfterDismissal) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
                            continue;
                        }

                        const shift = shiftMap.get(`${emp.id}|${dayStr}`);
                        if (shift) {
                            if (shift.type === 'REGULAR') {
                                cell.value = shift.hours;
                                cell.fill = fillRegular;
                                cell.font = { bold: true, color: { argb: 'FF1E3A5F' } };
                            } else if (shift.type === 'ARCHIVE_WORK') {
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
                        }
                    }
                    mainRow.height = 22;
                };

                if (accountantSheet) {
                    writeShiftsToSheet(accountantSheet, accRowIdx);
                    const row = accountantSheet.getRow(accRowIdx);
                    
                    const colHours = daysInMonth + 2;
                    const colBase = daysInMonth + 3;
                    const colBonuses = daysInMonth + 4;
                    const colTotal = daysInMonth + 5;

                    row.getCell(colHours).value = hoursWorked;
                    row.getCell(colHours).style = { ...cellStyle, numFmt: '0.0', border: borderStyle, alignment: { horizontal: 'right', vertical: 'middle' } };

                    row.getCell(colBase).value = baseShiftPay;
                    row.getCell(colBase).style = { ...cellStyle, numFmt: '#,##0', border: borderStyle, alignment: { horizontal: 'right', vertical: 'middle' } };

                    row.getCell(colBonuses).value = totalBonuses;
                    row.getCell(colBonuses).style = { ...cellStyle, numFmt: '#,##0', border: borderStyle, alignment: { horizontal: 'right', vertical: 'middle' } };

                    row.getCell(colTotal).value = total;
                    row.getCell(colTotal).style = { ...cellStyle, font: { bold: true }, numFmt: '#,##0', border: borderStyle, alignment: { horizontal: 'right', vertical: 'middle' } };
                    
                    accRowIdx++;
                }

                if (accountant15Sheet) {
                    writeShiftsToSheet(accountant15Sheet, acc15RowIdx);
                    const row = accountant15Sheet.getRow(acc15RowIdx);

                    const colHours = daysInMonth + 2;
                    const colBase = daysInMonth + 3;

                    row.getCell(colHours).value = hoursWorked;
                    row.getCell(colHours).style = { ...cellStyle, numFmt: '0.0', border: borderStyle, alignment: { horizontal: 'right', vertical: 'middle' } };

                    row.getCell(colBase).value = baseShiftPay;
                    row.getCell(colBase).style = { ...cellStyle, numFmt: '#,##0', border: borderStyle, alignment: { horizontal: 'right', vertical: 'middle' } };

                    acc15RowIdx++;
                }
            }

            if (salarySheet) applyHeader(salarySheet);
            if (accountantSheet) applyHeader(accountantSheet, 4);
            if (accountant15Sheet) applyHeader(accountant15Sheet, 4);
        }

        return workbook;
    }

    static async generateSalarySlipWorkbook(date: string, employeeId: string): Promise<ExcelJS.Workbook> {
        const workbook = new ExcelJS.Workbook();
        const dateObj = parseISO(date);
        const startDate = startOfMonth(dateObj);
        const endDate = endOfMonth(dateObj);
        const monthStr = format(startDate, 'yyyy-MM');
        const monthYearRu = format(startDate, 'LLLL yyyy', { locale: ru }).toUpperCase();

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                salaryHistory: {
                    where: {
                        startDate: { lte: format(endDate, 'yyyy-MM-dd') },
                        OR: [{ endDate: null }, { endDate: { gte: format(startDate, 'yyyy-MM-dd') } }]
                    },
                    orderBy: { startDate: 'desc' },
                    take: 1
                }
            }
        });

        if (!employee) throw new Error('Employee not found');

        const normRecord = await prisma.monthlyNorm.findUnique({ where: { month: monthStr } });
        const monthNorm = normRecord?.hours || 176;

        const dateFilter = { gte: format(startDate, 'yyyy-MM-dd'), lte: format(endDate, 'yyyy-MM-dd') };
        const shifts = await prisma.shift.findMany({ where: { employeeId, date: dateFilter, isDeleted: false } });
        const sales = await prisma.promotionSale.findMany({ where: { employeeId, date: dateFilter } });
        const regs = await prisma.registrationKpi.findMany({ where: { employeeId, date: dateFilter } });
        const dailyChecklists = await prisma.dailyChecklist.findMany({ where: { employeeId, date: dateFilter } });
        const monthlyChecklist = await prisma.monthlyChecklist.findUnique({ 
            where: { 
                month_employeeId: {
                    month: monthStr, 
                    employeeId 
                } 
            } 
        });

        const worksheet = workbook.addWorksheet('Расчетный лист');

        // === STYLES (exactly matching template) ===
        const borderThin = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } as ExcelJS.Borders;
        const fontA8 = { size: 8, name: 'Arial' } as Partial<ExcelJS.Font>;
        const fontA8b = { bold: true, size: 8, name: 'Arial' } as Partial<ExcelJS.Font>;
        const fontA9 = { size: 9, name: 'Arial' } as Partial<ExcelJS.Font>;
        const fontA9b = { bold: true, size: 9, name: 'Arial' } as Partial<ExcelJS.Font>;
        const fontA10b = { bold: true, size: 10, name: 'Arial' } as Partial<ExcelJS.Font>;
        const fontA11b = { bold: true, size: 11, name: 'Arial' } as Partial<ExcelJS.Font>;
        const wrapTop = { vertical: 'top', wrapText: true } as Partial<ExcelJS.Alignment>;
        const centerMid = { horizontal: 'center', vertical: 'middle' } as Partial<ExcelJS.Alignment>;
        const centerMidWrap = { horizontal: 'center', vertical: 'middle', wrapText: true } as Partial<ExcelJS.Alignment>;
        const centerTop = { horizontal: 'center', vertical: 'top' } as Partial<ExcelJS.Alignment>;
        const centerTopWrap = { horizontal: 'center', vertical: 'top', wrapText: true } as Partial<ExcelJS.Alignment>;
        const leftTop = { horizontal: 'left', vertical: 'top' } as Partial<ExcelJS.Alignment>;
        const leftTopWrap = { horizontal: 'left', vertical: 'top', wrapText: true } as Partial<ExcelJS.Alignment>;
        const rightMid = { horizontal: 'right', vertical: 'middle' } as Partial<ExcelJS.Alignment>;
        const rightTop = { horizontal: 'right', vertical: 'top' } as Partial<ExcelJS.Alignment>;

        // === COLUMN WIDTHS (exact from template) ===
        const colWidths = [3.5,3.5,3.5,3.5,3.5,3.5,7.66,7.16,6.16,4.83,5.16,5.83,3.5,3.5,3.5,3.5,3.5,3.5,5.66,3.5];
        worksheet.columns = colWidths.map(w => ({ width: w }));

        // Helper to style a merged range's master cell
        const sc = (addr: string, val: ExcelJS.CellValue, font: Partial<ExcelJS.Font>, align: Partial<ExcelJS.Alignment>, border = false) => {
            const c = worksheet.getCell(addr);
            c.value = val;
            c.font = font as ExcelJS.Font;
            c.alignment = align as ExcelJS.Alignment;
            if (border) c.border = borderThin;
        };

        // === ROW 1: Organization ===
        worksheet.getRow(1).height = 24.95;
        worksheet.mergeCells('A1:J1');
        sc('A1', 'Организация: Первый ДМЦ', fontA11b, centerTop);

        // === ROW 2: Title ===
        worksheet.getRow(2).height = 12;
        worksheet.mergeCells('A2:K2');
        sc('A2', `РАСЧЕТНЫЙ ЛИСТОК ЗА ${monthYearRu}`, fontA9, { horizontal: 'center' } as Partial<ExcelJS.Alignment>);

        // === ROW 3: FIO + Pay ===
        worksheet.getRow(3).height = 12;
        worksheet.mergeCells('A3:D3');
        sc('A3', 'ФИО ______________________________________________', fontA9b, leftTopWrap);
        worksheet.mergeCells('E3:S3');
        sc('E3', employee.name, fontA9b, centerTopWrap);

        // === Calculations ===
        const effectiveBaseSalary = (employee as EmployeeWithSalaryHistory).salaryHistory?.[0]?.baseSalary ?? employee.baseSalary;
        const hourlyBase = effectiveBaseSalary / monthNorm;

        let daysWorked = 0;
        let shiftPay = 0;
        let intensityTotal = 0;
        let closingBonuses = 0;
        let closingDays = 0;
        let traineeBonus = 0;
        let archiveBonus = 0;
        let archiveHours = 0;
        let hoursWorked = 0;

        shifts.forEach(s => {
            if (s.type === 'REGULAR') {
                daysWorked++;
                hoursWorked += s.hours;
                shiftPay += hourlyBase * s.hours;
                intensityTotal += hourlyBase * s.hours * (s.coefficient - 1);
            } else if (s.type === 'ARCHIVE_WORK') {
                archiveHours += s.hours;
                archiveBonus += (3500 / 11) * s.hours;
            }
            if (s.cabinetClosed || s.centerClosed) closingDays++;
            if (s.cabinetClosed) closingBonuses += 250;
            if (s.centerClosed) closingBonuses += 500;
            if (s.isTrainee) traineeBonus += 500;
        });

        const salesBonus = sales.reduce((sum, s) => sum + s.bonus, 0);
        const salesTotal = sales.reduce((sum, s) => sum + s.price, 0);
        const cardCreationBonus = (monthlyChecklist?.cardCreation || 0) * 60;
        const sickOpening = monthlyChecklist?.sickLeaveOpening || 0;
        const sickClosing = monthlyChecklist?.sickLeaveClosing || 0;
        const elnBonus = sickOpening * 130 + sickClosing * 80;
        const avgDailyChecklist = dailyChecklists.length > 0
            ? dailyChecklists.reduce((sum, c) => sum + c.totalScore, 0) / dailyChecklists.length
            : 0;
        const manualChecklist = monthlyChecklist?.percentage || 0;
        const avgChecklist = dailyChecklists.length > 0 ? avgDailyChecklist : manualChecklist;
        let checklistBonus = 0;
        if (avgChecklist >= 90) checklistBonus = 5000;
        else if (avgChecklist >= 76) checklistBonus = 2500;
        const avgQuality = regs.length > 0 ? (regs.reduce((sum, r) => sum + r.totalScore, 0) / regs.reduce((sum, r) => sum + (r.count * 3 || 1), 0)) * 100 : 100;
        let qualityBonus = 0;
        if (avgQuality >= 95) qualityBonus = 5000;
        else if (avgQuality >= 85) qualityBonus = 2500;

        if (monthStr >= '2026-05') {
            const coeff = Math.min(1.0, Math.round((hoursWorked / monthNorm) * 100) / 100);
            checklistBonus = Math.round(checklistBonus * coeff);
            qualityBonus = Math.round(qualityBonus * coeff);
        }
        const seniority = calculateSeniorityBonus(employee, effectiveBaseSalary);
        const seniorityPct = seniority.percent;
        const seniorityBonus = seniority.bonus;

        const totalAccrued = Math.round(shiftPay + intensityTotal + checklistBonus + qualityBonus + salesBonus + closingBonuses + archiveBonus + elnBonus + traineeBonus + cardCreationBonus + seniorityBonus);
        const tax = Math.round(totalAccrued * 0.13);
        const toPay = totalAccrued - tax;

        // K vyplate
        sc('T3', 'К выплате:', fontA9b, { vertical: 'top' } as Partial<ExcelJS.Alignment>);
        worksheet.mergeCells('AD3:AG3');
        sc('AD3', toPay, fontA9b, rightTop);

        // === ROW 4: Position ===
        worksheet.getRow(4).height = 11.25;
        sc('A4', 'Должность:', fontA8, { vertical: 'top' } as Partial<ExcelJS.Alignment>);
        worksheet.mergeCells('E4:L4');
        sc('E4', employee.role === 'ADMIN' ? 'Администратор регистратуры' : getEmployeeRoleLabel(employee.role), fontA8, { vertical: 'top', wrapText: true } as Partial<ExcelJS.Alignment>);

        // === ROW 5: Department ===
        worksheet.getRow(5).height = 15.75;
        sc('A5', 'Подразделение:', fontA8, { vertical: 'top' } as Partial<ExcelJS.Alignment>);
        worksheet.mergeCells('E5:S5');
        sc('E5', employee.branch || 'Информационно-аналитический отдел поликлиники', fontA8, { vertical: 'top', wrapText: true } as Partial<ExcelJS.Alignment>);

        // === ROW 6: Salary ===
        worksheet.getRow(6).height = 15.75;
        worksheet.mergeCells('A6:D6');
        sc('A6', 'Оклад', fontA8, leftTop);
        worksheet.mergeCells('E6:G6');
        sc('E6', effectiveBaseSalary, fontA8, { ...leftTop, wrapText: true } as Partial<ExcelJS.Alignment>);

        // === ROW 7: Section label ===
        worksheet.getRow(7).height = 15.75;
        sc('A7', 'Состав начислений', fontA8b, { vertical: 'top' } as Partial<ExcelJS.Alignment>);

        // ==========================
        // SECTION 1: Accruals Table
        // ==========================
        // Row 8-9: Header (2-row high merged)
        worksheet.getRow(8).height = 11.25;
        worksheet.getRow(9).height = 11.25;
        worksheet.mergeCells('A8:G9');
        sc('A8', 'Вид', fontA8b, leftTop, true);
        worksheet.mergeCells('H8:J9');
        sc('H8', 'Расчетная база', fontA8b, centerTopWrap, true);
        worksheet.mergeCells('K8:L9');
        sc('K8', 'Начислено (руб.)', fontA8b, centerTopWrap, true);
        worksheet.mergeCells('M8:O9');
        sc('M8', 'Удержано (руб.) 13%', fontA8b, centerTopWrap, true);
        worksheet.mergeCells('P8:S9');
        sc('P8', 'Сумма', fontA8b, centerTop, true);

        // Data rows helper for section 1
        const addSec1Row = (rowNum: number, label: string, base: string, accrued: number) => {
            worksheet.getRow(rowNum).height = 33.75;
            worksheet.mergeCells(`A${rowNum}:G${rowNum}`);
            worksheet.mergeCells(`H${rowNum}:J${rowNum}`);
            worksheet.mergeCells(`K${rowNum}:L${rowNum}`);
            worksheet.mergeCells(`M${rowNum}:O${rowNum}`);
            worksheet.mergeCells(`P${rowNum}:S${rowNum}`);
            const rowTax = Math.round(accrued * 0.13);
            const rowSum = accrued - rowTax;
            sc(`A${rowNum}`, label, fontA8, wrapTop, true);
            sc(`H${rowNum}`, base, fontA8, centerMid, true);
            sc(`K${rowNum}`, accrued, fontA8, centerMid, true);
            sc(`M${rowNum}`, rowTax, fontA8, centerMid, true);
            sc(`P${rowNum}`, rowSum, fontA8, rightMid, true);
        };

        addSec1Row(10, 'Оклад по дням', `${daysWorked} дней`, Math.round(shiftPay));
        addSec1Row(11, 'Доплата за интенсивность работы', `${daysWorked} дней`, Math.round(intensityTotal));
        addSec1Row(12, 'Чек-лист', `Выполение ${avgChecklist.toFixed(0)}%`, checklistBonus);
        addSec1Row(13, 'Качество оформления карт', `Выполнение ${avgQuality.toFixed(0)}%`, qualityBonus);
        addSec1Row(14, '% от продаж', `${salesTotal}`, salesBonus);
        addSec1Row(15, 'Открытие/закрытие центра', `${closingDays} дней`, closingBonuses);
        addSec1Row(16, 'Работа в архиве', `${archiveHours} часов`, Math.round(archiveBonus));
        addSec1Row(17, 'Оформление ЭЛН', `${sickOpening} открытия, ${sickClosing} закрытий`, elnBonus);
        addSec1Row(18, 'Доплата за обучение стажёра', `${shifts.filter(s => s.isTrainee).length} дня`, traineeBonus);
        addSec1Row(19, 'Доплата за создание новых карт пациентов', `${monthlyChecklist?.cardCreation || 0} штуки`, cardCreationBonus);
        addSec1Row(20, 'Доплата за стаж работы', `${seniorityPct}% от оклада`, seniorityBonus);

        // Row 21: Totals
        worksheet.getRow(21).height = 15;
        worksheet.mergeCells('A21:G21');
        worksheet.mergeCells('H21:J21');
        worksheet.mergeCells('K21:L21');
        worksheet.mergeCells('M21:O21');
        worksheet.mergeCells('P21:S21');
        sc('A21', 'Всего начислено', fontA10b, { horizontal: 'left' } as Partial<ExcelJS.Alignment>, true);
        sc('H21', format(startDate, 'yyyy-MM-dd'), fontA10b, rightTop, true);
        sc('K21', totalAccrued, fontA10b, rightTop, true);
        sc('M21', tax, fontA10b, centerTop, true);
        sc('P21', toPay, fontA10b, rightTop, true);

        // ==========================
        // SECTION 2: Intensity details
        // ==========================
        // Row 23: Title
        worksheet.mergeCells('A23:S23');
        sc('A23', '2. Детализация доплаты за интенсивность работы (от выручки)', fontA8b, leftTopWrap);

        // Rows 24-29: Reference table
        const refData = [[120000, 1], [130000, 1.1], [140000, 1.2], [150000, 1.3], [160000, 1.4], [170000, 1.5]];
        refData.forEach((rd, i) => {
            const r = 24 + i;
            worksheet.mergeCells(`A${r}:G${r}`);
            sc(`A${r}`, rd[0], fontA8, { horizontal: 'center' } as Partial<ExcelJS.Alignment>, true);
            sc(`H${r}`, rd[1], fontA8, {} as Partial<ExcelJS.Alignment>, true);
        });

        // Row 31: daily header
        worksheet.mergeCells('A31:G31');
        sc('A31', 'число', fontA8, { horizontal: 'center' } as Partial<ExcelJS.Alignment>, true);
        sc('H31', 'сумма', fontA8, {} as Partial<ExcelJS.Alignment>, true);

        // Daily intensity rows starting at 32
        let curRow = 32;
        const intensityShifts = shifts.filter(s => s.type === 'REGULAR' && s.coefficient > 1);
        intensityShifts.forEach(s => {
            worksheet.mergeCells(`A${curRow}:G${curRow}`);
            const d = parseISO(s.date);
            sc(`A${curRow}`, d, fontA8, { horizontal: 'center' } as Partial<ExcelJS.Alignment>, true);
            worksheet.getCell(`A${curRow}`).numFmt = 'DD.MM.YYYY';
            sc(`H${curRow}`, Math.round(hourlyBase * s.hours * (s.coefficient - 1)), fontA8, {} as Partial<ExcelJS.Alignment>, true);
            curRow++;
        });

        // Итого за месяц
        worksheet.mergeCells(`A${curRow}:G${curRow}`);
        sc(`A${curRow}`, 'Итого за месяц ', fontA8b, { horizontal: 'center' } as Partial<ExcelJS.Alignment>, true);
        sc(`H${curRow}`, Math.round(intensityTotal), fontA8b, {} as Partial<ExcelJS.Alignment>, true);
        curRow++;

        // ==========================
        // SECTION 3: Checklist
        // ==========================
        curRow += 1; // blank row
        worksheet.getRow(curRow).height = 13.5;
        worksheet.mergeCells(`A${curRow}:S${curRow}`);
        sc(`A${curRow}`, '3. Детализация доплаты за качество обслуживания (чек-лист)', fontA8b, leftTopWrap);
        curRow++;

        // Header row
        worksheet.getRow(curRow).height = 23.25;
        worksheet.mergeCells(`A${curRow}:G${curRow}`);
        sc(`A${curRow}`, 'Критерии чек-листа (KPI)', fontA8b, centerMid, true);
        worksheet.mergeCells(`H${curRow}:J${curRow}`);
        sc(`H${curRow}`, 'Максимально балл', fontA8b, centerMidWrap, true);
        worksheet.mergeCells(`K${curRow}:O${curRow}`);
        sc(`K${curRow}`, 'Фактический балл', fontA8b, centerMidWrap, true);
        worksheet.mergeCells(`P${curRow}:S${curRow}`);
        curRow++;

        const getAvgCrit = (crit: keyof typeof dailyChecklists[0]) => {
            if (dailyChecklists.length === 0) return 0;
            return dailyChecklists.reduce((sum, c) => sum + (Number(c[crit]) || 0), 0) / dailyChecklists.length;
        };

        const critLabels = [
            ['1. Внешний вид и дисциплина', 16.5],
            ['2. Приветствие и первичный контакт', 21],
            ['3. Соблюдение алгоритма прием и этапов обслуживания', 24.75],
            ['4. Стимулирование пользования услугами центра', 22.5],
            ['5. Работа с возражениями и конфликты', 22.5],
            ['6. Завершение контакта', 15],
        ];

        critLabels.forEach((item, i) => {
            const label = item[0] as string;
            const h = item[1] as number;
            worksheet.getRow(curRow).height = h;
            worksheet.mergeCells(`A${curRow}:G${curRow}`);
            sc(`A${curRow}`, label, fontA8, wrapTop, true);
            worksheet.mergeCells(`H${curRow}:J${curRow}`);
            sc(`H${curRow}`, 1, fontA8, centerMid, true);
            worksheet.mergeCells(`K${curRow}:O${curRow}`);
            sc(`K${curRow}`, Math.round(getAvgCrit(`criterion${i + 1}` as RegistrationCriterionKey)) / 100, fontA8, centerMid, true);
            worksheet.mergeCells(`P${curRow}:S${curRow}`);
            curRow++;
        });

        // Итого баллов
        worksheet.mergeCells(`A${curRow}:G${curRow}`);
        sc(`A${curRow}`, 'Итого баллов: ', fontA8b, centerMid, true);
        worksheet.mergeCells(`H${curRow}:J${curRow}`);
        sc(`H${curRow}`, 1, fontA8b, centerMid, true);
        worksheet.mergeCells(`K${curRow}:O${curRow}`);
        const avgCritTotal = critLabels.reduce((sum, _, i) => sum + (Math.round(getAvgCrit(`criterion${i + 1}` as RegistrationCriterionKey)) / 100), 0) / 6;
        sc(`K${curRow}`, Math.round(avgCritTotal * 100) / 100, fontA8b, centerMid, true);
        worksheet.mergeCells(`P${curRow}:S${curRow}`);
        curRow++;

        // ==========================
        // SECTION 4: Card quality  
        // ==========================
        curRow += 1; // blank row
        worksheet.mergeCells(`A${curRow}:S${curRow}`);
        sc(`A${curRow}`, '4. Детализация доплаты за качество оформления карт', fontA8b, leftTopWrap);
        curRow++;

        // Header
        worksheet.mergeCells(`A${curRow}:G${curRow}`);
        sc(`A${curRow}`, 'Критерии оценки', fontA8b, centerMid, true);
        worksheet.mergeCells(`H${curRow}:J${curRow}`);
        sc(`H${curRow}`, 'Максимально балл', fontA8b, centerMidWrap, true);
        worksheet.mergeCells(`K${curRow}:O${curRow}`);
        sc(`K${curRow}`, 'Фактический балл', fontA8b, centerMidWrap, true);
        worksheet.mergeCells(`P${curRow}:S${curRow}`);
        curRow++;

        const totalRegCount = regs.reduce((s, r) => s + (r.count || 1), 0);

        const regLabels = ['1. Правильность заполнения карт', '2. Указана эл.почта', '3. Указано доверенное лицо'];
        regLabels.forEach((l, i) => {
            worksheet.mergeCells(`A${curRow}:G${curRow}`);
            sc(`A${curRow}`, l, fontA8, wrapTop, true);
            // H = total checks, I-J = max score per check (1)
            sc(`H${curRow}`, totalRegCount, fontA8, centerMid, true);
            worksheet.mergeCells(`I${curRow}:J${curRow}`);
            sc(`I${curRow}`, 1, fontA8, centerMid, true);
            worksheet.mergeCells(`K${curRow}:L${curRow}`);
            const key = `criterion${i + 1}` as RegistrationCriterionKey;
            const factScore = regs.reduce((s, r) => s + getRegistrationCriterion(r, key), 0);
            sc(`K${curRow}`, factScore, fontA8, centerMid, true);
            worksheet.mergeCells(`M${curRow}:O${curRow}`);
            const pct = totalRegCount > 0 ? factScore / totalRegCount : 0;
            sc(`M${curRow}`, Math.round(pct * 10000) / 10000, fontA8, centerMid, true);
            worksheet.mergeCells(`P${curRow}:S${curRow}`);
            curRow++;
        });

        // Итого row
        worksheet.mergeCells(`A${curRow}:G${curRow}`);
        sc(`A${curRow}`, 'Итого:', fontA8b, centerMid, true);
        sc(`H${curRow}`, totalRegCount * 3, fontA8b, centerMid, true);
        worksheet.mergeCells(`K${curRow}:L${curRow}`);
        const totalRegFactScore = regLabels.reduce((s, _, i) => {
            const key = `criterion${i + 1}` as RegistrationCriterionKey;
            return s + regs.reduce((rs, r) => rs + getRegistrationCriterion(r, key), 0);
        }, 0);
        sc(`K${curRow}`, totalRegFactScore, fontA8b, centerMid, true);
        worksheet.mergeCells(`M${curRow}:O${curRow}`);
        const avgRegPct = regLabels.length > 0 ? regLabels.reduce((s, _, i) => {
            const key = `criterion${i + 1}` as RegistrationCriterionKey;
            const fs = regs.reduce((rs, r) => rs + getRegistrationCriterion(r, key), 0);
            return s + (totalRegCount > 0 ? fs / totalRegCount : 0);
        }, 0) / regLabels.length : 0;
        sc(`M${curRow}`, Math.round(avgRegPct * 10000) / 10000, fontA8b, centerMid, true);
        worksheet.mergeCells(`P${curRow}:Q${curRow}`);
        curRow++;

        // ==========================
        // SECTION 5: Sales
        // ==========================
        curRow += 1;
        worksheet.getRow(curRow).height = 11.25;
        worksheet.mergeCells(`A${curRow}:S${curRow}`);
        sc(`A${curRow}`, '5. Детализация начислений % от продаж', fontA8b, leftTopWrap);
        curRow++;

        // Header  
        worksheet.getRow(curRow).height = 24.75;
        worksheet.mergeCells(`A${curRow}:G${curRow}`);
        sc(`A${curRow}`, 'Наименование акции/услуги', fontA8b, centerMidWrap, true);
        worksheet.mergeCells(`H${curRow}:J${curRow}`);
        sc(`H${curRow}`, 'Сумма продаж', fontA8b, centerMidWrap, true);
        worksheet.mergeCells(`K${curRow}:L${curRow}`);
        sc(`K${curRow}`, '%', fontA8b, centerMid, true);
        worksheet.mergeCells(`M${curRow}:O${curRow}`);
        sc(`M${curRow}`, 'Итого ', fontA8b, centerMid, true);
        curRow++;

        sales.forEach(s => {
            worksheet.mergeCells(`A${curRow}:G${curRow}`);
            sc(`A${curRow}`, s.productName, fontA8, wrapTop, true);
            worksheet.mergeCells(`H${curRow}:J${curRow}`);
            sc(`H${curRow}`, s.price, fontA8, centerMid, true);
            worksheet.mergeCells(`K${curRow}:L${curRow}`);
            const pct = s.price > 0 ? s.bonus / s.price : 0;
            sc(`K${curRow}`, Math.round(pct * 100) / 100, fontA8, centerMid, true);
            worksheet.mergeCells(`M${curRow}:O${curRow}`);
            sc(`M${curRow}`, s.bonus, fontA8, centerMid, true);
            curRow++;
        });

        // Sales итого
        worksheet.mergeCells(`A${curRow}:G${curRow}`);
        sc(`A${curRow}`, 'Итого: ', fontA8b, centerMid, true);
        worksheet.mergeCells(`H${curRow}:J${curRow}`);
        sc(`H${curRow}`, salesTotal, fontA8b, centerMid, true);
        worksheet.mergeCells(`M${curRow}:O${curRow}`);
        sc(`M${curRow}`, salesBonus, fontA8b, centerMid, true);

        return workbook;
    }

    static async generateDetailizationWorkbook(date: string, employeeId: string): Promise<ExcelJS.Workbook> {
        const dateObj = parseISO(date);
        const startDate = startOfMonth(dateObj);
        const endDate = endOfMonth(dateObj);
        const monthStr = format(startDate, 'yyyy-MM');

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                salaryHistory: {
                    where: {
                        startDate: { lte: format(endDate, 'yyyy-MM-dd') },
                        OR: [{ endDate: null }, { endDate: { gte: format(startDate, 'yyyy-MM-dd') } }]
                    },
                    orderBy: { startDate: 'desc' },
                    take: 1
                }
            }
        });

        if (!employee) throw new Error('Employee not found');
        if (employee.role === 'MANAGER') throw new Error('Managers do not have detailization reports');

        const normRecord = await prisma.monthlyNorm.findUnique({ where: { month: monthStr } });
        const monthNorm = normRecord?.hours || 176;
        const effectiveBaseSalary = (employee as EmployeeWithSalaryHistory).salaryHistory?.[0]?.baseSalary ?? employee.baseSalary;
        const hourlyBase = effectiveBaseSalary / monthNorm;

        const dateFilter = { gte: format(startDate, 'yyyy-MM-dd'), lte: format(endDate, 'yyyy-MM-dd') };
        const shifts = await prisma.shift.findMany({ where: { employeeId, date: dateFilter, isDeleted: false } });
        const sales = await prisma.promotionSale.findMany({ where: { employeeId, date: dateFilter } });
        const regs = await prisma.registrationKpi.findMany({ where: { employeeId, date: dateFilter } });
        const dailyChecklists = await prisma.dailyChecklist.findMany({ where: { employeeId, date: dateFilter } });
        const monthlyChecklist = await prisma.monthlyChecklist.findUnique({
            where: {
                month_employeeId: {
                    month: monthStr,
                    employeeId
                }
            }
        });

        let intensityDays = 0;
        let intensityBonus = 0;
        let closingDays = 0;
        let closingBonus = 0;
        let archiveHours = 0;
        let archiveBonus = 0;
        let traineeDays = 0;
        let traineeBonus = 0;
        let hoursWorked = 0;

        shifts.forEach(s => {
            if (s.type === 'REGULAR') {
                intensityDays++;
                hoursWorked += s.hours;
                intensityBonus += hourlyBase * s.hours * Math.max(0, s.coefficient - 1);
            } else if (s.type === 'ARCHIVE_WORK') {
                archiveHours += s.hours;
                archiveBonus += (3500 / 11) * s.hours;
            }

            if (s.cabinetClosed || s.centerClosed) closingDays++;
            if (s.cabinetClosed) closingBonus += 250;
            if (s.centerClosed) closingBonus += 500;
            if (s.isTrainee) {
                traineeDays++;
                traineeBonus += 500;
            }
        });

        const salesTotal = sales.reduce((sum, s) => sum + s.price, 0);
        const salesBonus = sales.reduce((sum, s) => sum + s.bonus, 0);

        const avgDailyChecklist = dailyChecklists.length > 0
            ? dailyChecklists.reduce((sum, c) => sum + c.totalScore, 0) / dailyChecklists.length
            : 0;
        const manualChecklist = monthlyChecklist?.percentage || 0;
        const checklistPercent = dailyChecklists.length > 0 ? avgDailyChecklist : manualChecklist;
        let checklistBonus = 0;
        if (checklistPercent >= 90) checklistBonus = 5000;
        else if (checklistPercent >= 76) checklistBonus = 2500;

        const qualityTotalScore = regs.reduce((sum, r) => sum + r.totalScore, 0);
        const qualityMaxScore = regs.reduce((sum, r) => sum + (r.maxScore || (r.count * 3) || 0), 0);
        const cardQualityPercent = qualityMaxScore > 0 ? (qualityTotalScore / qualityMaxScore) * 100 : 100;
        let cardQualityBonus = 0;
        if (cardQualityPercent >= 95) cardQualityBonus = 5000;
        else if (cardQualityPercent >= 85) cardQualityBonus = 2500;

        if (monthStr >= '2026-05') {
            const coeff = Math.min(1.0, Math.round((hoursWorked / monthNorm) * 100) / 100);
            checklistBonus = Math.round(checklistBonus * coeff);
            cardQualityBonus = Math.round(cardQualityBonus * coeff);
        }

        const sickLeaveOpening = monthlyChecklist?.sickLeaveOpening || 0;
        const sickLeaveClosing = monthlyChecklist?.sickLeaveClosing || 0;
        const sickLeaveBonus = (sickLeaveOpening * 130) + (sickLeaveClosing * 80);

        const cardCreationCount = monthlyChecklist?.cardCreation || 0;
        const cardCreationBonus = cardCreationCount * 60;

        const seniority = calculateSeniorityBonus(employee, effectiveBaseSalary);
        const seniorityPercent = seniority.percent;
        const seniorityBonus = seniority.bonus;

        return await buildDetailizationWorkbook({
            employeeName: employee.name,
            reportDate: startDate,
            intensityDays,
            intensityBonus: Math.round(intensityBonus),
            checklistPercent: Math.round(checklistPercent),
            checklistBonus,
            cardQualityPercent: Math.round(cardQualityPercent),
            cardQualityBonus,
            salesTotal: Math.round(salesTotal * 100) / 100,
            salesBonus: Math.round(salesBonus * 100) / 100,
            closingDays,
            closingBonus,
            archiveHours: Math.round(archiveHours * 100) / 100,
            archiveBonus: Math.round(archiveBonus),
            sickLeaveOpening,
            sickLeaveClosing,
            sickLeaveBonus,
            traineeDays,
            traineeBonus,
            cardCreationCount,
            cardCreationBonus,
            seniorityPercent,
            seniorityBonus
        });
    }

    static async generateAllSalarySlipsZip(date: string): Promise<Buffer> {
        const dateObj = parseISO(date);
        const startDate = startOfMonth(dateObj);
        const endDate = endOfMonth(dateObj);
        const folderName = format(startDate, 'yyyy-MM');

        const employees = await prisma.employee.findMany({
            where: {
                role: { not: 'MANAGER' },
                AND: [
                    { OR: [{ dismissalDate: "" }, { dismissalDate: { gte: format(startDate, 'yyyy-MM-dd') } }] },
                    { OR: [{ hireDate: "" }, { hireDate: { lte: format(endDate, 'yyyy-MM-dd') } }] }
                ]
            }
        });

        const zip = new JSZip();
        for (const emp of employees) {
            const workbook = await this.generateSalarySlipWorkbook(date, emp.id);
            const buffer = await workbook.xlsx.writeBuffer();
            const fileName = `${emp.name.replace(/\s+/g, '_')}_${folderName}.xlsx`;
            zip.file(fileName, buffer);
        }

        return await zip.generateAsync({ type: 'nodebuffer' });
    }
}

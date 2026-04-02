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

        const empFilter = employeeId ? { id: employeeId } : {
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
        if (type === 'FULL' || type === 'KPI' || type === 'ACCOUNTANT') {
            const salarySheet = (type === 'FULL' || type === 'KPI') ? workbook.addWorksheet('Зарплата') : null;
            const accountantSheet = (type === 'FULL' || type === 'ACCOUNTANT') ? workbook.addWorksheet('Для бухгалтера') : null;

            if (salarySheet) {
                const salaryCols = [
                { header: 'Сотрудник', key: 'name', width: 25, style: cellStyle },
                { header: 'Оклад', key: 'base', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                { header: 'Часы', key: 'hours', width: 12, style: { ...cellStyle, numFmt: '0.0' } },
                { header: 'Смены (Руб)', key: 'shiftPay', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                { header: 'Работа в арх.', key: 'dayOffPay', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                { header: 'Откр/Закр', key: 'closing', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
            ];

            if (startDate < new Date('2026-04-01')) {
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

            if (accountantSheet) {
                accountantSheet.columns = [
                    { header: 'Сотрудник', key: 'name', width: 25, style: cellStyle },
                    { header: 'Часы', key: 'hours', width: 12, style: { ...cellStyle, numFmt: '0.0' } },
                    { header: 'Оклад', key: 'base_paid', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                    { header: 'Надбавки', key: 'bonuses', width: 15, style: { ...cellStyle, numFmt: '#,##0' } },
                    { header: 'ИТОГО', key: 'total', width: 15, style: { ...cellStyle, font: { bold: true }, numFmt: '#,##0' } },
                ];
            }

            const allShifts = await prisma.shift.findMany({
                where: { date: dateFilter, isDeleted: false, ...(employeeId ? { employeeId } : {}) }
            });
            const allSales = await prisma.promotionSale.findMany({ where: { date: dateFilter, employeeId: employeeId || undefined } });

            // For registrations and KPI records, we need ALL of them to calculate team averages for Seniors
            const allKpi = await prisma.kpiRecord.findMany({ where: { date: dateFilter } });
            const allRegs = await prisma.registrationKpi.findMany({ where: { date: dateFilter } });

            // We also need ALL active employees for finding subordinates
            const allActiveEmployees = await prisma.employee.findMany({
                where: {
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
                }
            });

            // Fetch monthly checklists
            const allChecklists = await prisma.monthlyChecklist.findMany({
                where: { month: monthStr }
            });

            for (const emp of employees) {
                if (emp.role === 'MANAGER') continue;

                const empShifts = allShifts.filter(s => s.employeeId === emp.id);
                const empSales = allSales.filter(s => s.employeeId === emp.id);
                const empRegs = allRegs.filter(r => r.employeeId === emp.id);
                const empLegacyKpi = allKpi.filter(k => k.employeeId === emp.id);

                let hoursWorked = 0;
                let shiftPay = 0;
                let dayOffPayTotal = 0;
                let closingBonuses = 0;
                let actingLeadBonus = 0;
                let traineeBonus = 0;
                const hourlyBase = emp.baseSalary / monthNorm;

                empShifts.forEach(s => {
                    if (s.type === 'REGULAR') {
                        hoursWorked += s.hours;
                        shiftPay += hourlyBase * s.hours * s.coefficient;
                    } else if (s.type === 'ARCHIVE_WORK') {
                        dayOffPayTotal += (3500 / 11) * s.hours;
                    }
                    if (s.cabinetClosed) closingBonuses += 250;
                    if (s.centerClosed) closingBonuses += 500;
                    if (s.isActingLead && startDate < new Date('2026-04-01')) actingLeadBonus += 250;
                    if (s.isTrainee) traineeBonus += 500;
                });

                const salesBonus = empLegacyKpi.reduce((sum, k) => sum + k.salesBonus, 0) +
                    empSales.reduce((sum, s) => sum + s.bonus, 0);

                // New quality calculation logic for report service
                const getIndividualQuality = (e: any) => {
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
                let finalQuality = ownQuality;

                // Restore missing checklist/manual bonus variables
                const empChecklist = allChecklists.find(c => c.employeeId === emp.id) as any;
                const ownChecklist = empChecklist ? empChecklist.percentage / 100 : 0;
                const sickLeaveOpening = empChecklist ? (empChecklist.sickLeaveOpening || 0) : 0;
                const sickLeaveClosing = empChecklist ? (empChecklist.sickLeaveClosing || 0) : 0;
                const cardCreation = empChecklist ? (empChecklist.cardCreation || 0) : 0;
                const manualClosingBonus = empChecklist ? (empChecklist.closingBonus || 0) : 0;

                // Use checklist percentage
                let calcChecklist = ownChecklist;

                const sickLeaveBonus = (sickLeaveOpening * 130) + (sickLeaveClosing * 80);
                const cardBonus = cardCreation * 60;

                let kpiBonus = 0;
                if (finalQuality >= 0.95) kpiBonus = 5000;
                else if (finalQuality >= 0.85) kpiBonus = 2500;

                let checklistBonus = 0;
                if (calcChecklist >= 0.90) checklistBonus = 5000;
                else if (calcChecklist >= 0.76) checklistBonus = 2500;

                // Seniority (Выслуга)
                const hireDateStr = (emp as any).hireDate;
                const hireDateParsed = hireDateStr ? new Date(hireDateStr) : null;
                const dismissalDateStr = (emp as any).dismissalDate;
                const dismissalDateParsed = dismissalDateStr ? new Date(dismissalDateStr) : null;

                const isHireDateValid = hireDateParsed && !isNaN(hireDateParsed.getTime());

                // Use dismissal date as end point if it exists
                const calculationEndDate = (dismissalDateParsed && dismissalDateParsed < new Date())
                    ? dismissalDateParsed.getTime()
                    : Date.now();

                const seniorityYears = isHireDateValid
                    ? (calculationEndDate - hireDateParsed!.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                    : 0;

                let seniorityBonus = 0;
                const baseSalary = emp.baseSalary || 0;
                if (seniorityYears >= 3) seniorityBonus = Math.round(baseSalary * 0.10);
                else if (seniorityYears >= 2) seniorityBonus = Math.round(baseSalary * 0.07);
                else if (seniorityYears >= 1) seniorityBonus = Math.round(baseSalary * 0.03);

                const bonuses = Math.round(dayOffPayTotal + closingBonuses + actingLeadBonus + traineeBonus + salesBonus + kpiBonus + checklistBonus + seniorityBonus + sickLeaveBonus + cardBonus);
                const total = Math.round(shiftPay + bonuses);

                if (salarySheet) {
                    const row = salarySheet.addRow({
                        name: emp.name,
                        base: emp.baseSalary,
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

                if (accountantSheet) {
                    const row = accountantSheet.addRow({
                        name: emp.name,
                        hours: hoursWorked,
                        base_paid: Math.round(shiftPay),
                        bonuses: bonuses,
                        total: total
                    });
                    row.eachCell((cell) => { cell.border = borderStyle; });
                }
            }

            if (salarySheet) applyHeader(salarySheet);
            if (accountantSheet) applyHeader(accountantSheet);
        }

        return workbook;
    }
}

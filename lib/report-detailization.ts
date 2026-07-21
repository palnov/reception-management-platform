import ExcelJS from 'exceljs';
import { ARCHIVE_WORK_REPORT_LABEL } from './report-labels';

export type DetailizationWorkbookData = {
    employeeName: string;
    reportDate: Date;
    intensityDays: number;
    intensityBonus: number;
    checklistPercent: number;
    checklistBonus: number;
    cardQualityPercent: number;
    cardQualityBonus: number;
    salesTotal: number;
    salesBonus: number;
    closingDays: number;
    closingBonus: number;
    archiveHours: number;
    archiveBonus: number;
    sickLeaveOpening: number;
    sickLeaveClosing: number;
    sickLeaveBonus: number;
    traineeDays: number;
    traineeBonus: number;
    cardCreationCount: number;
    cardCreationBonus: number;
    seniorityPercent: number;
    seniorityBonus: number;
};

type BorderSide = Partial<ExcelJS.Border>;

const thin: BorderSide = { style: 'thin' };
const noBorder: BorderSide = {};

const fontA8 = { name: 'Arial', size: 8, charset: 204 } as Partial<ExcelJS.Font>;
const fontA9 = { name: 'Arial', size: 9, charset: 204 } as Partial<ExcelJS.Font>;
const fontA9b = { name: 'Arial', size: 9, bold: true, charset: 204 } as Partial<ExcelJS.Font>;
const fontA10b = { name: 'Arial', size: 10, bold: true, charset: 204 } as Partial<ExcelJS.Font>;

const textTop = { vertical: 'top', wrapText: true } as Partial<ExcelJS.Alignment>;
const center = { horizontal: 'center', vertical: 'middle' } as Partial<ExcelJS.Alignment>;
const centerWrap = { horizontal: 'center', vertical: 'middle', wrapText: true } as Partial<ExcelJS.Alignment>;
const centerTop = { horizontal: 'center', vertical: 'top' } as Partial<ExcelJS.Alignment>;
const rightTop = { horizontal: 'right', vertical: 'top' } as Partial<ExcelJS.Alignment>;

function border(top: BorderSide, right: BorderSide, bottom: BorderSide, left: BorderSide): Partial<ExcelJS.Borders> {
    return { top, right, bottom, left };
}

function setCell(
    worksheet: ExcelJS.Worksheet,
    address: string,
    value: ExcelJS.CellValue,
    options: {
        font?: Partial<ExcelJS.Font>;
        alignment?: Partial<ExcelJS.Alignment>;
        border?: Partial<ExcelJS.Borders>;
        numFmt?: string;
    } = {}
) {
    const cell = worksheet.getCell(address);
    cell.value = value;
    if (options.font) cell.font = options.font as ExcelJS.Font;
    if (options.alignment) cell.alignment = options.alignment as ExcelJS.Alignment;
    if (options.border) cell.border = options.border as ExcelJS.Borders;
    if (options.numFmt) cell.numFmt = options.numFmt;
    return cell;
}

function styleRange(
    worksheet: ExcelJS.Worksheet,
    row: number,
    from: number,
    to: number,
    options: {
        font?: Partial<ExcelJS.Font>;
        alignment?: Partial<ExcelJS.Alignment>;
        borders: Partial<ExcelJS.Borders>[];
    }
) {
    for (let col = from; col <= to; col++) {
        const cell = worksheet.getRow(row).getCell(col);
        if (options.font) cell.font = options.font as ExcelJS.Font;
        if (options.alignment) cell.alignment = options.alignment as ExcelJS.Alignment;
        cell.border = options.borders[col - from] as ExcelJS.Borders;
    }
}

function mergeCellsWithoutStyle(worksheet: ExcelJS.Worksheet, range: string) {
    worksheet.mergeCellsWithoutStyle(range);
}

function setupTemplateGrid(worksheet: ExcelJS.Worksheet) {
    worksheet.properties.defaultRowHeight = 15;

    worksheet.getColumn(4).width = 6;
    for (const col of [5, 6, 7]) {
        worksheet.getColumn(col).width = 9.140625;
        worksheet.getColumn(col).hidden = true;
    }
    worksheet.getColumn(9).width = 8.140625;
    worksheet.getColumn(10).width = 9.140625;
    worksheet.getColumn(10).hidden = true;
    worksheet.getColumn(12).width = 9;
    for (let col = 13; col <= 19; col++) {
        worksheet.getColumn(col).width = 9.140625;
        worksheet.getColumn(col).hidden = true;
    }

    const merges = [
        'A1:K1',
        'A2:D2', 'E2:S2',
        'A3:G4', 'H3:J4', 'K3:L4', 'M3:S4',
        'A5:G5', 'H5:J5', 'K5:L5',
        'A6:G6', 'H6:J6', 'K6:L6',
        'A7:G7', 'H7:J7', 'K7:L7',
        'A8:G8', 'H8:J8', 'K8:L8',
        'A9:G9', 'H9:J9', 'K9:L9',
        'A10:G10', 'H10:J10', 'K10:L10',
        'A11:G11', 'H11:J11', 'K11:L11',
        'A12:G12', 'H12:J12', 'K12:L12',
        'A13:G13', 'H13:J13', 'K13:L13',
        'A14:G14', 'H14:J14', 'K14:L14',
        'A15:G15', 'H15:J15', 'K15:L15', 'M15:S15',
        'K17:L17', 'K18:L18',
    ];

    for (const range of merges) mergeCellsWithoutStyle(worksheet, range);
}

function applyTemplateBorders(worksheet: ExcelJS.Worksheet) {
    styleRange(worksheet, 1, 1, 11, {
        font: fontA9b,
        alignment: centerTop,
        borders: Array.from({ length: 11 }, () => border(noBorder, noBorder, noBorder, noBorder)),
    });

    styleRange(worksheet, 2, 1, 4, {
        font: fontA9b,
        alignment: textTop,
        borders: Array.from({ length: 4 }, () => border(noBorder, noBorder, noBorder, noBorder)),
    });
    styleRange(worksheet, 2, 5, 19, {
        font: fontA9b,
        alignment: centerTop,
        borders: Array.from({ length: 15 }, () => border(noBorder, noBorder, noBorder, noBorder)),
    });

    styleRange(worksheet, 3, 1, 7, {
        font: fontA9b,
        alignment: textTop,
        borders: Array.from({ length: 7 }, () => border(thin, thin, noBorder, thin)),
    });
    styleRange(worksheet, 4, 1, 7, {
        font: fontA9b,
        alignment: textTop,
        borders: [
            border(noBorder, noBorder, thin, thin),
            ...Array.from({ length: 5 }, () => border(noBorder, noBorder, thin, noBorder)),
            border(noBorder, thin, thin, noBorder),
        ],
    });
    styleRange(worksheet, 3, 8, 10, {
        font: fontA9b,
        alignment: centerTop,
        borders: [
            border(thin, noBorder, noBorder, thin),
            border(thin, noBorder, noBorder, noBorder),
            border(thin, thin, noBorder, noBorder),
        ],
    });
    styleRange(worksheet, 4, 8, 10, {
        font: fontA9b,
        alignment: centerTop,
        borders: [
            border(noBorder, noBorder, thin, thin),
            border(noBorder, noBorder, thin, noBorder),
            border(noBorder, thin, thin, noBorder),
        ],
    });
    styleRange(worksheet, 3, 11, 12, {
        font: fontA9b,
        alignment: centerTop,
        borders: [
            border(thin, noBorder, noBorder, thin),
            border(thin, thin, noBorder, noBorder),
        ],
    });
    styleRange(worksheet, 4, 11, 12, {
        font: fontA9b,
        alignment: centerTop,
        borders: [
            border(noBorder, noBorder, thin, thin),
            border(noBorder, thin, thin, noBorder),
        ],
    });
    styleRange(worksheet, 3, 13, 19, {
        font: fontA9b,
        alignment: centerTop,
        borders: Array.from({ length: 7 }, () => border(noBorder, noBorder, noBorder, noBorder)),
    });
    styleRange(worksheet, 4, 13, 19, {
        font: fontA9b,
        alignment: centerTop,
        borders: Array.from({ length: 7 }, () => border(noBorder, noBorder, noBorder, noBorder)),
    });

    const fullBorders = (length: number) => Array.from({ length }, () => border(thin, thin, thin, thin));
    const mergedRowBorders = (length: number) => [
        border(thin, noBorder, thin, thin),
        ...Array.from({ length: length - 2 }, () => border(thin, noBorder, thin, noBorder)),
        border(thin, thin, thin, noBorder),
    ];

    for (let row = 5; row <= 15; row++) {
        const isTotal = row === 15;
        const labelFont = isTotal ? fontA10b : fontA8;
        const valueFont = isTotal ? fontA10b : fontA8;
        const leftBorders = (row === 5 || row === 6 || row === 7 || row === 15) ? fullBorders(7) : mergedRowBorders(7);
        const baseBorders = (row === 6 || row === 7 || row === 15) ? fullBorders(3) : mergedRowBorders(3);
        const accruedBorders = (row === 6 || row === 7 || row === 15) ? fullBorders(2) : mergedRowBorders(2);

        styleRange(worksheet, row, 1, 7, {
            font: labelFont,
            alignment: textTop,
            borders: leftBorders,
        });
        styleRange(worksheet, row, 8, 10, {
            font: valueFont,
            alignment: row === 15 ? rightTop : centerWrap,
            borders: baseBorders,
        });
        styleRange(worksheet, row, 11, 12, {
            font: valueFont,
            alignment: row === 15 ? rightTop : center,
            borders: accruedBorders,
        });
    }

    for (let row = 5; row <= 15; row++) {
        styleRange(worksheet, row, 13, 19, {
            font: fontA8,
            alignment: textTop,
            borders: Array.from({ length: 7 }, () => border(noBorder, noBorder, noBorder, noBorder)),
        });
    }

    for (const row of [17, 18]) {
        styleRange(worksheet, row, 1, 3, {
            font: fontA9,
            borders: Array.from({ length: 3 }, () => border(noBorder, noBorder, noBorder, noBorder)),
        });
        styleRange(worksheet, row, 11, 12, {
            font: fontA9,
            alignment: center,
            borders: row === 17
                ? [border(noBorder, noBorder, thin, noBorder), border(noBorder, noBorder, thin, noBorder)]
                : [border(thin, noBorder, thin, noBorder), border(thin, noBorder, thin, noBorder)],
        });
    }
}

function pluralRu(value: number, one: string, few: string, many: string) {
    const abs = Math.abs(value);
    const last = abs % 10;
    const lastTwo = abs % 100;
    if (last === 1 && lastTwo !== 11) return one;
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
    return many;
}

export function formatDays(value: number) {
    return `${value} ${pluralRu(value, 'день', 'дня', 'дней')}`;
}

export function buildDetailizationWorkbook(data: DetailizationWorkbookData) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HR Platform';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Лист1');
    workbook.addWorksheet('Лист2');
    workbook.addWorksheet('Лист3');
    setupTemplateGrid(worksheet);
    applyTemplateBorders(worksheet);

    setCell(worksheet, 'A1', 'ДЕТАЛИЗАЦИЯ ДОПЛАТЫ ЗА ВЫПОЛНЕНИЕ KPI', { font: fontA9b, alignment: centerTop });
    setCell(worksheet, 'A2', 'ФИО __________________________________________________________', { font: fontA9b, alignment: textTop });
    setCell(worksheet, 'E2', data.employeeName, { font: fontA9b, alignment: centerTop });

    setCell(worksheet, 'A3', 'Вид', { font: fontA9b, alignment: textTop });
    setCell(worksheet, 'H3', 'Расчетная база', { font: fontA9b, alignment: centerTop });
    setCell(worksheet, 'K3', 'Начислено (руб.)', { font: fontA9b, alignment: centerTop });

    const rows = [
        ['A5', 'H5', 'K5', 'Доплата за интенсивность работы', formatDays(data.intensityDays), data.intensityBonus],
        ['A6', 'H6', 'K6', 'Чек-лист', `Выполение ${data.checklistPercent}% `, data.checklistBonus],
        ['A7', 'H7', 'K7', 'Качество оформления карт', `Выполнение ${data.cardQualityPercent}%`, data.cardQualityBonus],
        ['A8', 'H8', 'K8', '% от продаж', data.salesTotal, data.salesBonus],
        ['A9', 'H9', 'K9', 'Открытие/закрытие центра', formatDays(data.closingDays), data.closingBonus],
        ['A10', 'H10', 'K10', ARCHIVE_WORK_REPORT_LABEL, `${data.archiveHours} ${pluralRu(data.archiveHours, 'час', 'часа', 'часов')}`, data.archiveBonus],
        ['A11', 'H11', 'K11', 'Оформление ЭЛН', `${data.sickLeaveOpening} ${pluralRu(data.sickLeaveOpening, 'открытие', 'открытия', 'открытий')}, ${data.sickLeaveClosing} ${pluralRu(data.sickLeaveClosing, 'закрытие', 'закрытия', 'закрытий')}`, data.sickLeaveBonus],
        ['A12', 'H12', 'K12', 'Доплата за обучение стажёра', formatDays(data.traineeDays), data.traineeBonus],
        ['A13', 'H13', 'K13', 'Доплата за создание новых карт пациентов', `${data.cardCreationCount} ${pluralRu(data.cardCreationCount, 'штука', 'штуки', 'штук')}`, data.cardCreationBonus],
        ['A14', 'H14', 'K14', 'Доплата за стаж работы', `${data.seniorityPercent}% от оклада`, data.seniorityBonus],
    ] as const;

    for (const [labelCell, baseCell, accruedCell, label, base, accrued] of rows) {
        setCell(worksheet, labelCell, label, { font: fontA8, alignment: textTop });
        setCell(worksheet, baseCell, base, { font: fontA8, alignment: centerWrap });
        setCell(worksheet, accruedCell, accrued, { font: fontA8, alignment: center });
    }

    const accruedTotal = Math.round((data.intensityBonus + data.checklistBonus + data.cardQualityBonus + data.salesBonus + data.closingBonus + data.archiveBonus + data.sickLeaveBonus + data.traineeBonus + data.cardCreationBonus + data.seniorityBonus) * 100) / 100;
    const accruedTotalFormula: ExcelJS.CellFormulaValue = {
        formula: 'SUM(K5:L14)',
        result: accruedTotal,
    };

    setCell(worksheet, 'A15', 'Всего начислено', { font: fontA10b, alignment: textTop });
    setCell(worksheet, 'H15', data.reportDate, { font: fontA10b, alignment: rightTop, numFmt: 'mmm-yy' });
    setCell(worksheet, 'K15', accruedTotalFormula, { font: fontA10b, alignment: rightTop, numFmt: '#,##0.00' });
    setCell(worksheet, 'A17', 'Утверждено (руководитель службы заботы)', { font: fontA9 });
    setCell(worksheet, 'A18', 'Сотрудник', { font: fontA9 });

    worksheet.getCell('K8').numFmt = '#,##0.00';
    worksheet.getCell('K15').numFmt = '#,##0.00';

    return workbook;
}

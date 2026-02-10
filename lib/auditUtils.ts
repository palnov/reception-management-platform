export const FIELD_NAMES: Record<string, string> = {
    // Common
    date: 'Дата',
    employeeId: 'Сотрудник',

    // Shift
    type: 'Тип смены',
    hours: 'Часы',
    cabinetClosed: 'Кабинет закрыт',
    coefficient: 'Коэффициент',

    // KPI
    qualityScore: 'Качество',
    errorsCount: 'Ошибки',
    salesBonus: 'Бонус за продажи',
    checkList: 'Чек-лист',

    // Sales
    patientId: 'ID Пациента',
    productName: 'Продукт',
    price: 'Цена',
    bonus: 'Бонус',

    // Registration
    criterion1: 'Указана почта',
    criterion2: 'Указано доверенное лицо',
    criterion3: 'Правильность заполнения',
    totalScore: 'Итоговый балл',
    maxScore: 'Макс. балл',

    // System
    action: 'Действие',
    createdAt: 'Создано',
    createdBy: 'Автор'
};

export function formatFieldName(key: string): string {
    return FIELD_NAMES[key] || key;
}

export function formatValue(value: any, key?: string): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Да' : 'Нет';

    if (key === 'type') {
        const types: Record<string, string> = {
            'REGULAR': 'Смена',
            'DAY_OFF_WORK': 'Работа в вых.',
            'SICK': 'Больничный',
            'VACATION': 'Отпуск'
        };
        return types[value] || value;
    }

    return String(value);
}

export const EMPLOYEE_ROLES = {
    ADMIN: 'ADMIN',
    SENIOR: 'SENIOR',
    MANAGER: 'MANAGER',
    HOSPITALIZATION_MANAGER: 'HOSPITALIZATION_MANAGER',
} as const;

export const DEFAULT_MAX_COEFFICIENT = 1.5;
export const MIN_COEFFICIENT = 1.0;
export const HOSPITALIZATION_MANAGER_MAX_COEFFICIENT = 2.0;
export const COEFFICIENT_STEP = 0.1;

export const EMPLOYEE_ROLE_LABELS: Record<string, string> = {
    [EMPLOYEE_ROLES.ADMIN]: 'Администратор',
    [EMPLOYEE_ROLES.SENIOR]: 'Старший смены',
    [EMPLOYEE_ROLES.MANAGER]: 'Руководитель',
    [EMPLOYEE_ROLES.HOSPITALIZATION_MANAGER]: 'Менеджер по госпитализации',
};

type EmployeeCoefficientSource = {
    role?: string | null;
    maxCoefficient?: number | null;
};

export function canCustomizeMaxCoefficient(role: string | null | undefined) {
    return role === EMPLOYEE_ROLES.HOSPITALIZATION_MANAGER;
}

export function clampNumber(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function normalizeEmployeeMaxCoefficient(role: string | null | undefined, value: string | number | null | undefined) {
    if (!canCustomizeMaxCoefficient(role)) return DEFAULT_MAX_COEFFICIENT;

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_MAX_COEFFICIENT;

    return clampNumber(parsed, MIN_COEFFICIENT, HOSPITALIZATION_MANAGER_MAX_COEFFICIENT);
}

export function getEmployeeRoleLabel(role: string | null | undefined) {
    return EMPLOYEE_ROLE_LABELS[role || ''] || role || '';
}

export function getEmployeeShiftCoefficientLimit(employee: EmployeeCoefficientSource | null | undefined) {
    return normalizeEmployeeMaxCoefficient(employee?.role, employee?.maxCoefficient ?? DEFAULT_MAX_COEFFICIENT);
}

export function clampShiftCoefficient(value: string | number | null | undefined, employee: EmployeeCoefficientSource | null | undefined) {
    const parsed = Number(value);
    const coefficient = Number.isFinite(parsed) ? parsed : MIN_COEFFICIENT;

    return clampNumber(coefficient, MIN_COEFFICIENT, getEmployeeShiftCoefficientLimit(employee));
}

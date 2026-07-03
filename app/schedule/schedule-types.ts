export type ShiftType = 'REGULAR' | 'ARCHIVE_WORK' | 'SICK' | 'VACATION';

export type ShiftFormData = {
    type: ShiftType;
    hours: string;
    cabinetClosed: boolean;
    centerClosed: boolean;
    isActingLead: boolean;
    isTrainee: boolean;
    coefficient: string;
};

export type AuditLog = {
    id: string;
    action: string;
    changedBy: string;
    changedByRole: string;
    timestamp: string;
    details: string | null;
};

export type Employee = {
    id: string;
    name: string;
    role: string;
    baseSalary: number;
    hourlyRate: number;
    maxCoefficient?: number;
    branch?: string | null;
    hireDate?: string;
    dismissalDate?: string;
    sortOrder: number;
    seniorId?: string | null;
};

export type Shift = {
    id: string;
    date: string;
    employeeId: string;
    type: ShiftType;
    hours: number;
    cabinetClosed: boolean;
    centerClosed: boolean;
    coefficient: number;
    isActingLead: boolean;
    isTrainee?: boolean;
    createdBy?: string;
    auditLogs?: AuditLog[];
    isDeleted?: boolean;
};

export type CurrentUser = {
    id: string;
    name: string;
    role: string;
    baseSalary?: number;
};

export type SelectionState = {
    start: { empId: string, date: string, shift?: Shift };
    end: { empId: string, date: string };
};

export type SelectionBounds = {
    minEmpIdx: number;
    maxEmpIdx: number;
    minDateIdx: number;
    maxDateIdx: number;
};

export type BatchShiftOperation = {
    id?: string;
    date: string;
    employeeId: string;
    type: ShiftType;
    hours: number | string;
    cabinetClosed: boolean;
    centerClosed: boolean;
    isActingLead?: boolean;
    isTrainee?: boolean;
    coefficient: number | string;
};

export type BatchShiftDeleteOperation = {
    id: string;
    delete: true;
};

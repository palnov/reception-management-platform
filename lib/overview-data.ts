import { subMonths } from 'date-fns';
import { prisma } from './prisma';
import { getCurrentEmployee } from './current-user';
import type { AuditLog, Prisma } from '@prisma/client';

type EntityWithId = {
    id: string;
};

function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

export function getMonthRange(month: string) {
    const [year, monthNumber] = month.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNumber, 0));

    return {
        start: formatDate(startDate),
        end: formatDate(endDate),
        startDate,
        endDate,
    };
}

function groupLogsByEntityId(logs: AuditLog[]) {
    const logsByEntityId = new Map<string, AuditLog[]>();

    for (const log of logs) {
        if (!logsByEntityId.has(log.entityId)) {
            logsByEntityId.set(log.entityId, []);
        }
        logsByEntityId.get(log.entityId)!.push(log);
    }

    return logsByEntityId;
}

function withAuditLogs<T extends EntityWithId>(items: T[], logs: AuditLog[]) {
    const logsByEntityId = groupLogsByEntityId(logs);
    return items.map((item) => ({
        ...item,
        auditLogs: logsByEntityId.get(item.id) || [],
    }));
}

function auditLogSelect(includeDetails: boolean) {
    return includeDetails
        ? undefined
        : {
            id: true,
            entityId: true,
            entityType: true,
            action: true,
            changedBy: true,
            changedByRole: true,
            timestamp: true,
        };
}

export async function getKpiOverview({
    start,
    end,
    month,
    includeDetails,
    isManager,
}: {
    start: string;
    end: string;
    month: string;
    includeDetails: boolean;
    isManager: boolean;
}) {
    const currentUserPromise = getCurrentEmployee();
    const employeesPromise = prisma.employee.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { dismissalDate: '' },
                        { dismissalDate: { gte: start } },
                    ],
                },
                {
                    OR: [
                        { hireDate: '' },
                        { hireDate: { lte: end } },
                    ],
                },
            ],
        },
        orderBy: { sortOrder: 'asc' },
        select: {
            id: true,
            name: true,
            role: true,
            baseSalary: true,
            hourlyRate: true,
            maxCoefficient: true,
            hireDate: true,
            branch: true,
            dismissalDate: true,
            seniorId: true,
            sortOrder: isManager,
            roleHistory: {
                where: {
                    startDate: { lte: start },
                    OR: [
                        { endDate: null },
                        { endDate: { gte: start } },
                    ],
                },
                take: 1,
            },
            salaryHistory: {
                where: {
                    startDate: { lte: start },
                    OR: [
                        { endDate: null },
                        { endDate: { gte: start } },
                    ],
                },
                take: 1,
            },
        },
    });
    const shiftsPromise = prisma.shift.findMany({
        where: {
            date: { gte: start, lte: end },
            isDeleted: false,
        },
    });
    const kpiRecordsPromise = prisma.kpiRecord.findMany({
        where: { date: { gte: start, lte: end } },
        include: { employee: true },
    });
    const promotionSalesPromise = prisma.promotionSale.findMany({
        where: { date: { gte: start, lte: end } },
        include: { employee: true },
        orderBy: { date: 'desc' },
    });
    const registrationKpisPromise = prisma.registrationKpi.findMany({
        where: { date: { gte: start, lte: end } },
        include: { employee: true },
        orderBy: { date: 'desc' },
    });
    const monthlyChecklistsPromise = prisma.monthlyChecklist.findMany({
        where: { month },
    });
    const dailyChecklistsPromise = prisma.dailyChecklist.findMany({
        where: { date: { gte: start, lte: end } },
        include: { employee: true },
        orderBy: { date: 'desc' },
    });
    const normPromise = prisma.monthlyNorm.findUnique({
        where: { month },
    });

    const [
        currentUser,
        employees,
        shifts,
        kpiRecords,
        promotionSales,
        registrationKpis,
        monthlyChecklists,
        dailyChecklists,
        norm,
    ] = await Promise.all([
        currentUserPromise,
        employeesPromise,
        shiftsPromise,
        kpiRecordsPromise,
        promotionSalesPromise,
        registrationKpisPromise,
        monthlyChecklistsPromise,
        dailyChecklistsPromise,
        normPromise,
    ]);

    const select = auditLogSelect(includeDetails);
    const [
        shiftLogs,
        kpiLogs,
        saleLogs,
        registrationLogs,
        dailyChecklistLogs,
    ] = await Promise.all([
        shifts.length
            ? prisma.auditLog.findMany({
                where: { entityType: 'SHIFT', entityId: { in: shifts.map((item) => item.id) } },
                orderBy: { timestamp: 'desc' },
                select,
            })
            : [],
        kpiRecords.length
            ? prisma.auditLog.findMany({
                where: { entityType: 'KPI', entityId: { in: kpiRecords.map((item) => item.id) } },
                orderBy: { timestamp: 'desc' },
                select,
            })
            : [],
        promotionSales.length
            ? prisma.auditLog.findMany({
                where: { entityType: 'SALE', entityId: { in: promotionSales.map((item) => item.id) } },
                orderBy: { timestamp: 'desc' },
                select,
            })
            : [],
        registrationKpis.length
            ? prisma.auditLog.findMany({
                where: { entityType: 'REGISTRATION', entityId: { in: registrationKpis.map((item) => item.id) } },
                orderBy: { timestamp: 'desc' },
                select,
            })
            : [],
        dailyChecklists.length
            ? prisma.auditLog.findMany({
                where: { entityType: 'DAILY_CHECKLIST', entityId: { in: dailyChecklists.map((item) => item.id) } },
                orderBy: { timestamp: 'desc' },
                select,
            })
            : [],
    ]);

    return {
        currentUser,
        employees: employees
            .map((employee) => {
                const role = employee.roleHistory[0]?.role || employee.role;
                const seniorId = employee.roleHistory[0]?.seniorId ?? employee.seniorId;
                const baseSalary = employee.salaryHistory[0]?.baseSalary ?? employee.baseSalary;
                const hourlyRate = employee.salaryHistory[0]?.hourlyRate ?? employee.hourlyRate;

                return {
                    id: employee.id,
                    name: employee.name,
                    hireDate: employee.hireDate,
                    branch: employee.branch,
                    dismissalDate: employee.dismissalDate,
                    sortOrder: employee.sortOrder,
                    role,
                    seniorId,
                    baseSalary,
                    hourlyRate,
                    maxCoefficient: employee.maxCoefficient,
                };
            })
            .filter((employee) => employee.role !== 'MANAGER'),
        shifts: withAuditLogs(shifts, shiftLogs as AuditLog[]),
        kpiRecords: withAuditLogs(kpiRecords, kpiLogs as AuditLog[]),
        promotionSales: withAuditLogs(promotionSales, saleLogs as AuditLog[]),
        registrationKpis: withAuditLogs(registrationKpis, registrationLogs as AuditLog[]),
        monthlyChecklists,
        dailyChecklists: withAuditLogs(dailyChecklists, dailyChecklistLogs as AuditLog[]),
        monthNorm: norm?.hours || 176,
    };
}

export async function getScheduleOverview(month: string) {
    const { start, end, startDate } = getMonthRange(month);
    const currentUserPromise = getCurrentEmployee();
    const employeesPromise = prisma.employee.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { dismissalDate: '' },
                        { dismissalDate: { gte: start } },
                    ],
                },
                {
                    OR: [
                        { hireDate: '' },
                        { hireDate: { lte: end } },
                    ],
                },
            ],
        },
        orderBy: { sortOrder: 'asc' },
        select: {
            id: true,
            name: true,
            role: true,
            baseSalary: true,
            hourlyRate: true,
            maxCoefficient: true,
            branch: true,
            hireDate: true,
            dismissalDate: true,
            sortOrder: true,
            seniorId: true,
        },
    });
    const shiftsPromise = prisma.shift.findMany({
        where: {
            date: { gte: start, lte: end },
            isDeleted: false,
        },
    });
    const normPromise = prisma.monthlyNorm.findUnique({
        where: { month },
    });

    const [currentUser, employees, shifts, norm] = await Promise.all([
        currentUserPromise,
        employeesPromise,
        shiftsPromise,
        normPromise,
    ]);

    let prevMonthShifts: Prisma.ShiftGetPayload<object>[] = [];
    if (shifts.filter((shift) => !shift.isDeleted).length === 0) {
        const threeMonthsAgo = subMonths(startDate, 3);
        const prevMonth = subMonths(startDate, 1);
        const pStart = formatDate(new Date(Date.UTC(
            threeMonthsAgo.getUTCFullYear(),
            threeMonthsAgo.getUTCMonth(),
            1,
        )));
        const pEnd = formatDate(new Date(Date.UTC(
            prevMonth.getUTCFullYear(),
            prevMonth.getUTCMonth() + 1,
            0,
        )));

        prevMonthShifts = await prisma.shift.findMany({
            where: {
                date: { gte: pStart, lte: pEnd },
                isDeleted: false,
            },
        });
    }

    return {
        currentUser,
        employees: employees.filter((employee) => employee.role !== 'MANAGER'),
        shifts,
        prevMonthShifts,
        monthNorm: norm?.hours || 176,
    };
}

export type KpiOverview = Awaited<ReturnType<typeof getKpiOverview>>;
export type ScheduleOverview = Awaited<ReturnType<typeof getScheduleOverview>>;

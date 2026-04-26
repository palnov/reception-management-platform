import { cache } from 'react';
import { prisma } from './prisma';
import { getSession } from './auth';

export type CurrentEmployee = {
    id: string;
    name: string;
    role: string;
    baseSalary: number;
    hourlyRate: number;
};

export const getCurrentEmployee = cache(async (): Promise<CurrentEmployee | null> => {
    const session = await getSession();
    const employeeId = session?.employee?.id;

    if (!employeeId) return null;

    return prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
            id: true,
            name: true,
            role: true,
            baseSalary: true,
            hourlyRate: true,
        },
    });
});

export function toNavUser(employee: CurrentEmployee | null) {
    if (!employee) return null;

    return {
        id: employee.id,
        name: employee.name,
        role: employee.role,
    };
}

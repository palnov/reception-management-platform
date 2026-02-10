
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const targetEmployee = await prisma.employee.findFirst({
        where: { name: { contains: 'Бритнева' } }
    });

    if (!targetEmployee) {
        console.log('Employee not found');
        return;
    }

    const shift = await prisma.shift.findFirst({
        where: {
            employeeId: targetEmployee.id,
            date: '2026-02-03'
        }
    });

    console.log('Shift found:', JSON.stringify(shift, null, 2));

    if (shift) {
        const logs = await prisma.auditLog.findMany({
            where: {
                entityType: 'SHIFT',
                entityId: shift.id
            }
        });
        console.log('Audit logs for this shift:', JSON.stringify(logs, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

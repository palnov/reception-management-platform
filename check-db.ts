
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const employees = await prisma.employee.findMany({
        where: {
            OR: [
                { name: { contains: 'Морозова' } },
                { name: { contains: 'Бритнева' } }
            ]
        }
    });
    console.log('Employees found:', JSON.stringify(employees, null, 2));

    const logs = await prisma.auditLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' }
    });
    console.log('Recent Audit Logs:', JSON.stringify(logs, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

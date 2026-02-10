
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const log = await prisma.auditLog.create({
        data: {
            entityType: 'SHIFT',
            entityId: 'test-id',
            action: 'CREATE',
            changedBy: 'Test User',
            changedByRole: 'SENIOR',
            timestamp: new Date().toISOString()
        }
    });
    console.log('Created log:', JSON.stringify(log, null, 2));

    const allLogs = await prisma.auditLog.findMany();
    console.log('All logs now:', JSON.stringify(allLogs, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

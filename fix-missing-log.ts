
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const shiftId = 'e5c6f404-b8d9-4d2f-85a0-2b4f490e8e6a';

    const existingShift = await prisma.shift.findUnique({
        where: { id: shiftId }
    });

    if (!existingShift) {
        console.log('Shift not found');
        return;
    }

    const log = await prisma.auditLog.create({
        data: {
            entityType: 'SHIFT',
            entityId: shiftId,
            action: 'CREATE',
            changedBy: 'Морозова Олеся',
            changedByRole: 'SENIOR',
            timestamp: new Date().toISOString() // Or some estimate if we knew when it was created
        }
    });

    console.log('Manually created log:', JSON.stringify(log, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

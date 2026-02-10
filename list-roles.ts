
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const roles = await prisma.employee.findMany({
        select: { name: true, role: true }
    });
    console.log('All Roles:', JSON.stringify(roles, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

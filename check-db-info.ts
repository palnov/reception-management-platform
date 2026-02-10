
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check(table: string) {
    const info: any = await prisma.$queryRaw`PRAGMA table_info(${table})`;
    console.log(`Table ${table} info:`, info);
}

async function main() {
    await check('Shift');
    await check('KpiRecord');
    await check('PromotionSale');
    await check('RegistrationKpi');
    await check('AuditLog');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Проверяем, есть ли уже сотрудники (признак того, что база не пуста)
    const employeeCount = await prisma.employee.count();
    if (employeeCount > 0) {
        console.log('Database already has data (employees found). Skipping seed.');
        return;
    }

    console.log('Database is empty. Seeding initial norms...');
    const norm = await prisma.monthlyNorm.upsert({
        where: { month: '2026-02' },
        update: { hours: 152 },
        create: { month: '2026-02', hours: 152 }
    });
    console.log('Set Feb 2026 norm to:', norm.hours);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });

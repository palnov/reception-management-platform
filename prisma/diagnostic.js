const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const month = '2026-02';
        console.log('Searching for month:', month);
        const norm = await prisma.monthlyNorm.findUnique({
            where: { month }
        });
        console.log('Found norm:', norm);

        console.log('Testing findMany...');
        const all = await prisma.monthlyNorm.findMany();
        console.log('All norms:', all);
    } catch (e) {
        console.error('DIAGNOSTIC_ERROR:', e.message);
        console.error('FULL_ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();

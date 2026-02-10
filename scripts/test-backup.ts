
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Testing Backup Serialization...');

    const data = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        employees: await prisma.employee.findMany(),
        shifts: await prisma.shift.findMany(),
        kpiRecords: await prisma.kpiRecord.findMany(),
        monthlyNorms: await prisma.monthlyNorm.findMany(),
        promotionSales: await prisma.promotionSale.findMany(),
        registrationKpis: await prisma.registrationKpi.findMany(),
        auditLogs: await prisma.auditLog.findMany()
    };

    const json = JSON.stringify(data, null, 2);
    console.log(`Serialized Backup Size: ${(json.length / 1024).toFixed(2)} KB`);
    console.log('Keys included:', Object.keys(data));

    const filename = path.resolve('test-backup.json');
    fs.writeFileSync(filename, json);
    console.log(`Backup saved to ${filename}`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

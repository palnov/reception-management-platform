
import { ReportService } from '../lib/report-service';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Testing Report Generation...');

    // Ensure we have some data
    const count = await prisma.shift.count();
    console.log(`Found ${count} shifts.`);

    const date = '2026-02'; // Use current month or relevant month

    console.log(`Generating FULL report for ${date}...`);
    try {
        const workbook = await ReportService.generateExcel(date, 'FULL');
        const filename = path.resolve('test-report.xlsx');
        await workbook.xlsx.writeFile(filename);
        console.log(`Success! Report saved to ${filename}`);

        // Verify file exists and has size
        const stats = fs.statSync(filename);
        console.log(`File size: ${stats.size} bytes`);

    } catch (e) {
        console.error('Error generating report:', e);
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

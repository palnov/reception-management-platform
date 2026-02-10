import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/report-service';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JSZip from 'jszip';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.employee.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    const { date, type, employeeIds } = await request.json();

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
        return NextResponse.json({ error: 'No employees selected' }, { status: 400 });
    }

    try {
        const zip = new JSZip();
        const employees = await prisma.employee.findMany({
            where: {
                id: { in: employeeIds },
                role: { not: 'MANAGER' }
            }
        });

        // Generate reports in parallel
        const promises = employees.map(async (emp) => {
            const workbook = await ReportService.generateExcel(date, type, emp.id);
            const buffer = await workbook.xlsx.writeBuffer();
            // Sanitize filename
            const safeName = emp.name.replace(/[^a-z0-9а-яё]/gi, '_');
            zip.file(`${safeName}_${date}.xlsx`, buffer);
        });

        await Promise.all(promises);

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipBuffer = Buffer.from(await zipBlob.arrayBuffer());

        return new NextResponse(zipBuffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="Reports_${type}_${date}.zip"`
            }
        });

    } catch (error) {
        console.error('Batch Zip Error:', error);
        return NextResponse.json({ error: 'Failed to generate zip' }, { status: 500 });
    }
}

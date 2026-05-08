import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/report-service';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.employee.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    const { date, type, employeeId } = await request.json();

    try {
        const workbook = (type === 'SALARY_SLIP' && employeeId)
            ? await ReportService.generateSalarySlipWorkbook(date, employeeId)
            : (type === 'DETAILIZATION' && employeeId)
                ? await ReportService.generateDetailizationWorkbook(date, employeeId)
                : await ReportService.generateExcel(date, type, employeeId);

        if (!workbook) throw new Error('Failed to generate workbook');

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="Report_${type}_${date}.xlsx"`
            }
        });
    } catch (error) {
        console.error('Excel Export Error:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}

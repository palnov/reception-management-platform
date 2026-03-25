import { prisma } from './prisma';
import { startOfMonth, format, parseISO } from 'date-fns';

/**
 * Checks if a given month is closed for editing.
 * @param dateStr Can be "YYYY-MM-DD" or "YYYY-MM"
 */
export async function isMonthClosed(dateStr: string): Promise<boolean> {
  try {
    // Normalize to YYYY-MM
    let monthKey: string;
    if (dateStr.length === 7) {
      monthKey = dateStr;
    } else {
      const date = parseISO(dateStr);
      monthKey = format(startOfMonth(date), 'yyyy-MM');
    }

    const closedMonth = await prisma.closedMonth.findUnique({
      where: { month: monthKey }
    });

    return !!closedMonth?.isClosed;
  } catch (error) {
    console.error('isMonthClosed error:', error);
    return false; // Default to open on error
  }
}

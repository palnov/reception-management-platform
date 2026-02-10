
import { prisma } from './prisma';
import { getSession } from './auth';

export async function logAudit(
    entityType: 'SHIFT' | 'KPI' | 'SALE' | 'REGISTRATION',
    entityId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    details?: any,
    sessionOverride?: any
) {
    try {
        const session = sessionOverride || await getSession();
        if (!session?.employee) {
            console.warn(`[AUDIT] No session found for ${entityType}:${entityId}`);
            return;
        }

        console.log(`[AUDIT] Logging ${action} for ${entityType}:${entityId} by ${session.employee.name}`);

        await prisma.auditLog.create({
            data: {
                entityType,
                entityId,
                action,
                changedBy: session.employee.name,
                changedByRole: session.employee.role,
                timestamp: new Date().toISOString(),
                details: details ? JSON.stringify(details) : null
            }
        });
    } catch (error) {
        console.error('[AUDIT] FAILED_TO_LOG_AUDIT:', error);
    }
}

export function calculateDiff(oldData: any, newData: any, fieldsToIgnore: string[] = ['id', 'createdAt', 'createdBy', 'updatedAt', 'auditLogs', 'employee']) {
    const changes: Record<string, { old: any, new: any }> = {};

    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    allKeys.forEach(key => {
        if (fieldsToIgnore.includes(key)) return;

        const oldValue = oldData[key];
        const newValue = newData[key];

        // Simple comparison for primitives. For objects/arrays, JSON stringify might be needed for deep comparison if structure is complex,
        // but for our flat models, strict equality or simple type checks usually suffice.
        // We handles dates specially if they are strings/objects
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            // Filter out loose equality cases if needed, e.g. "5" == 5. But strict is better.
            // Actually, let's treat null and undefined as same? No, purely strictly for now.
            // Exception: 0 vs "0" might occur from form data.
            if (oldValue != newValue) { // Loose equality to catch 5 vs "5"
                changes[key] = { old: oldValue, new: newValue };
            }
        }
    });

    return Object.keys(changes).length > 0 ? changes : null;
}

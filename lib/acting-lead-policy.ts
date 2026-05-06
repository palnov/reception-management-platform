export const ACTING_LEAD_RETIRED_ON = '2026-04-01';

function toDateKey(value: Date | string) {
    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    return value.length === 7 ? `${value}-01` : value.slice(0, 10);
}

export function shouldIncludeActingLeadBonus(value: Date | string) {
    return toDateKey(value) < ACTING_LEAD_RETIRED_ON;
}


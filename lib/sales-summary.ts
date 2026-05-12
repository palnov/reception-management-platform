export interface PromotionSaleSummarySource {
    productName?: string | null;
}

export interface PromotionSaleSummaryItem {
    name: string;
    count: number;
}

export interface PromotionSaleSummary {
    total: number;
    items: PromotionSaleSummaryItem[];
}

function normalizeProductName(productName?: string | null) {
    return (productName || '').trim().replace(/\s+/g, ' ');
}

function productNameKey(productName?: string | null) {
    return normalizeProductName(productName).toLocaleLowerCase('ru-RU');
}

export function summarizePromotionSales(sales: PromotionSaleSummarySource[]): PromotionSaleSummary {
    const groups = new Map<string, PromotionSaleSummaryItem>();

    for (const sale of sales) {
        const normalizedName = normalizeProductName(sale.productName) || 'Без названия';
        const key = productNameKey(sale.productName) || productNameKey(normalizedName);
        const current = groups.get(key);

        if (current) {
            current.count += 1;
        } else {
            groups.set(key, { name: normalizedName, count: 1 });
        }
    }

    return {
        total: sales.length,
        items: Array.from(groups.values()).sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.name.localeCompare(b.name, 'ru-RU');
        }),
    };
}

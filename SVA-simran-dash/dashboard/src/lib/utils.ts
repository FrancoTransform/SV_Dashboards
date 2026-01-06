import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null) {
    if (value === null || value === undefined || value === "") return "n/a";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "n/a";

    // Round up to nearest whole dollar
    const rounded = Math.ceil(num);

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(rounded);
}

export function formatPercent(value: number | string | null) {
    if (value === null || value === undefined || value === "") return "n/a";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "n/a";
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
    }).format(num);
}

export function formatMultiple(value: number | string | null) {
    if (value === null || value === undefined || value === "") return "n/a";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "n/a";
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(num)}x`;
}

export function formatNumber(value: number | string | null) {
    if (value === null || value === undefined || value === "") return "n/a";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "n/a";
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num);
}

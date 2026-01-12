export const formatTime = (t: any): string => {
    if (!t && t !== 0) return '';

    if (typeof t === 'string') {
        return t.slice(0, 5);
    }

    if (t instanceof Date) {
        const hh = String(t.getHours()).padStart(2, '0');
        const mm = String(t.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    return String(t);
}

const pad = (n: number) => String(n).padStart(2, '0');

export const formatDate = (d: any): string => {
    if (!d && d !== 0) return '';

    if (d instanceof Date) {
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
    }

    if (typeof d === 'string') {
        const parsed = new Date(d);
        if (!isNaN(parsed.getTime())) {
            return `${pad(parsed.getDate())}.${pad(parsed.getMonth() + 1)}.${parsed.getFullYear()}`;
        }
    }

    return String(d);
}
export const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short'
    }).format(date);
};
export const formatDateLong = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long'
    }).format(date);
};

export const formatMonthYear = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric'
    }).format(date);
};

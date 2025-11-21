export const getBudgetColor = (spent: number, allocated: number): string => {
    if (allocated === 0) return 'text-gray-500';

    const percentage = (spent / allocated) * 100;

    if (percentage >= 90) return 'text-danger';
    if (percentage >= 70) return 'text-warning';
    return 'text-safe';
};

export const getBudgetColorHex = (spent: number, allocated: number): string => {
    if (allocated === 0) return '#9ca3af';

    const percentage = (spent / allocated) * 100;

    if (percentage >= 90) return '#f87171';
    if (percentage >= 70) return '#ffcc4d';
    return '#16c47f';
};
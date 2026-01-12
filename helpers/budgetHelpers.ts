export const getColorBySpent = (spend: number, allocated: number) => {
    const percentage = (spend / allocated) * 100;
    if(percentage < 70) return '#16c47f' // safe
    if(percentage >= 70 && percentage < 90) return '#ffcc4d' // warning
    return '#f87171' // danger
}

export const getBudgetPercentage = (spend: number, allocated: number) => {
    if (allocated === 0) return 0;
    return (spend / allocated) * 100;
}

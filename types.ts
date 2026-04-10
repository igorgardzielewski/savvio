
export type BudgetCategory = {
    id: number;
    name: string;
    iconUri: string;
    color: string;
    allocated: number;
    spent: number;
};
export type Goal = {
    id: number;
    name: string;
    color: string;
    amount: number;
    currentAmount: number;
    icon_sf_symbol: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}
export type BudgetCategoryResponse = {
    budgetLimit: number,
    budgetCategory: BudgetCategory,
};
export type ShopCategory = {
    id: number;
    categoryName: string;
    color: string;
}
export type Shop = {
    id: number;
    name: string;
    logoUrl: string;
    categoryName: string;
    categoryColor: string;
}
export type budgetTransaction = {
    id: number;
    budgetLimit: number;
    spent: number;
}
export type ReceiptItemData = {
    id: number;
    name: string;
    quantity: string;
    unit: string;
    totalItemPrice: number;
}
export type Transaction = {
    id: number;
    amount: number;
    date: Date;
    time: string;
    type: string;
    shop: Shop;
    budgetCategory: BudgetCategory;
    budget: budgetTransaction;
    receiptPositions: ReceiptItemData[] | null;
}
export type transactionList = {
    [date: string]: Transaction[];
}
export type TransactionCategoriesGroups = {
    categoryName: string;
    spent: number;
    percentageInAllSpents: number;
    categoryColor: string;
}
export type Period = "MONTHLY" | "YEARLY" | "ONE_TIME";
export type Subscription = {
    id: number,
    shop: Shop,
    paymentDate: string,
    price: string,
    period: Period,
    color: string,
    transactions: Transaction[],
    shouldNotify?: boolean
}
export type FamilyMember = {
    userId: number;
    firstName: string;
    lastName: string;
    shareLevel: 'NONE' | 'SUMMARY' | 'ALL';
    owner: boolean;
    budgetPercentage: number;
    joinedAt?: string;
    spent?: number;
    budgetLimit?: number;
    transactions?: Transaction[] | null;
}

export type Family = {
    id: number;
    inviteCode?: string;
    inviteCodeExpiresAt?: string;
    members: FamilyMember[];
    createdAt: string;
}

export type ReportBudgetSummary = {
    budgetLimit: number;
    totalSpent: number;
    remaining: number;
    percentageUsed: number;
    dateStart: string;
    dateEnd: string;
    transactionCount: number;
    aiTip: string | null;
}

export type ReportCategoryBreakdown = {
    name: string;
    allocated: number;
    spent: number;
    percentageUsed: number;
    color: string;
    iconUri: string;
    transactionCount: number;
}

export type ReportTopExpense = {
    amount: number;
    date: string;
    time: string;
    shop: Shop;
    budgetCategoryShort: BudgetCategoryShort;
}
export type BudgetCategoryShort = {
    name: string;
    color: string;
    iconUri: string;
}
export type ReportDailySpending = {
    date: string;
    amount: number;
}

export type ReportSubscriptionsSummary = {
    totalMonthly: number;
    count: number;
    subscriptions: {
        name: string;
        price: number;
        period: Period;
        logoUrl: string;
        color: string;
    }[];
}

export type ReportGoal = {
    name: string;
    targetAmount: number;
    currentAmount: number;
    depositThisMonth: number;
    percentageComplete: number;
    color: string;
    iconUri: string;
}

export type ReportGoalsSummary = {
    activeGoals: number;
    totalDepositsThisMonth: number;
    goals: ReportGoal[];
    aiTip: string | null;
}

export type ReportComparison = {
    previousBudgetSpent: number;
    spendingChange: number;
    previousBudgetId: number;
    compareTo: string;
}

export type BudgetReport = {
    budgetSummary: ReportBudgetSummary;
    categoryBreakdown: ReportCategoryBreakdown[];
    topExpenses: ReportTopExpense[];
    dailySpending: ReportDailySpending[];
    subscriptionsSummary: ReportSubscriptionsSummary;
    goalsSummary: ReportGoalsSummary;
    comparison: ReportComparison;
    categoryBreakdownAiTip: string | null;
    dailySpendingAiTip: string | null;
}

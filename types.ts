
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
    inviteCode?: string;          // only for owner
    inviteCodeExpiresAt?: string; // only for owner
    members: FamilyMember[];
    createdAt: string;
}

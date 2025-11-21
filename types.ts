import {SFSymbols6_0} from "sf-symbols-typescript";

export type BudgetCategory = {
    id: number;
    name: string;
    iconUri: SFSymbols6_0;
    color: string;
    allocated: number;
    spent: number;
};
export type BudgetCategoryResponse = {
    budgetLimit: number,
    budgetCategory: BudgetCategory,
};
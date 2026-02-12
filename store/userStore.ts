import { BudgetCategory, Family, Goal, Subscription, Transaction } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Budget = {
    id?: number,
    budgetLimit?: number,
    dateStart: string,
    dateEnd: string,
    spent?: number,
    budgetCategories?: BudgetCategory[],
}

export type User = {
    id?: number;
    email?: string;
    name?: string;
    emailVerified?: boolean;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    active?: boolean;
    currentBudget?: Budget;
    previousBudgets: Budget[];
    lastTransactions?: Transaction[];
    allTransactions?: { [date: string]: Transaction[] }
    subscriptions?: Subscription[];
    aiTutorialWatched?: boolean;
    premium?: boolean;
    premiumUntil?: string;
    dailyChatCount?: number;
    dailyOcrCount?: number;
    dailyChatLimit?: number;
    dailyOcrLimit?: number;
    usedChatLimitAt?: string | null;
    usedOcrLimitAt?: string | null;
    family?: Family | null;
    goals?: Goal[] | null;
};

type UserState = {
    user: User | null;
    isUserFetched: boolean;
    setUser: (u: User) => void;
    setCurrentBudget: (budget: Budget) => void;
    updateBudgetCategories: (categories: BudgetCategory[]) => void;
    addBudgetCategory: (category: BudgetCategory) => void;
    updateCurrentBudgetDateEnd: (dateEnd: string) => void;
    updateSpecificBudgetCategory: (budgetCategory: BudgetCategory) => void;
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (transactionId: number, updatedTransaction: Transaction, old: Transaction | null) => void;
    removeTransaction: (transactionId: number, allTransactions: Transaction[], removedTransaction: Transaction) => void;
    setAllTransactions: (transactions: { [date: string]: Transaction[] }) => void;
    setSubscriptions: (subscriptions: Subscription[]) => void;
    addSubscription: (subscription: Subscription) => void;
    removeSubscription: (subscription: Subscription) => void;
    updateUser: (partial: Partial<User>) => void;
    clearUser: () => void;
    updateFirstName: (firstName: string) => void;
    updateLastName: (lastName: string) => void;
    updateAiTutorialWatched: (watched: boolean) => void;
    updatePremium: (premium: boolean) => void;
    updatePremiumUntil: (premiumUntil: string) => void;
    updateDailyChatCount: (dailyChatCount: number) => void;
    updateDailyOcrCount: (dailyOcrCount: number) => void;
    updateUsedChatLimitAt: (usedChatLimitAt: string | null) => void;
    updateUsedOcrLimitAt: (usedOcrLimitAt: string | null) => void;
    updateFamily: (family: Family | null) => void;
    updateGoals: (goals: Goal[] | null) => void;
    addGoal: (goal: Goal) => void;
    updateGoal: (goalId: number, updatedGoal: Goal) => void;
    removeGoal: (goalId: number) => void;
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isUserFetched: false,
            setUser: (u) => set({ user: u, isUserFetched: true }),
            setCurrentBudget: (budget) =>
                set((s) =>
                    s.user
                        ? {
                            user: {
                                ...s.user,
                                currentBudget: budget,
                                previousBudgets: s.user.currentBudget
                                    ? [s.user.currentBudget, ...s.user.previousBudgets]
                                    : s.user.previousBudgets,
                            },
                        }
                        : s
                ),
            updateCurrentBudgetDateEnd: (dateEnd: string) =>
                set((s) =>
                    s.user?.currentBudget
                        ? {
                            user: {
                                ...s.user,
                                currentBudget: {
                                    ...s.user.currentBudget,
                                    dateEnd,
                                }
                            }
                        } : s
                ),
            updateBudgetCategories: (categories) =>
                set((s) =>
                    s.user?.currentBudget
                        ? {
                            user: {
                                ...s.user,
                                currentBudget: {
                                    ...s.user.currentBudget,
                                    budgetCategories: categories,
                                },
                            },
                        }
                        : s
                ),
            updateSpecificBudgetCategory: (budgetCategory: BudgetCategory) =>
                set((s) => {
                    if (!s.user?.currentBudget || !s.user) return s;

                    const currentBudgetLimit = s.user.currentBudget.budgetLimit || 0;
                    const oldBudgetCategory = s.user.currentBudget.budgetCategories?.find(cat => cat.id === budgetCategory.id);

                    let diff = 0;
                    if (oldBudgetCategory) {
                        diff = (budgetCategory.allocated || 0) - (oldBudgetCategory.allocated || 0);
                    }

                    const currentBudgetLimitAfterUpdate = currentBudgetLimit + diff;

                    return {
                        user: {
                            ...s.user,
                            currentBudget: {
                                ...s.user.currentBudget,
                                budgetLimit: currentBudgetLimitAfterUpdate,
                                budgetCategories: s.user.currentBudget.budgetCategories?.map(cat =>
                                    cat.id === budgetCategory.id ? budgetCategory : cat
                                )
                            }
                        }
                    };
                }),
            addBudgetCategory: (category: BudgetCategory) =>
                set((s) =>
                    s.user?.currentBudget
                        ? {
                            user: {
                                ...s.user,
                                currentBudget: {
                                    ...s.user.currentBudget,
                                    budgetCategories: [
                                        ...(s.user.currentBudget.budgetCategories || []),
                                        category,
                                    ],
                                },
                            },
                        }
                        : s
                ),
            addTransaction: (transaction: Transaction) =>
                set((s) => {
                    if (!s.user) return s;

                    let updatedBudget = s.user.currentBudget ? {
                        ...s.user.currentBudget,
                        spent: (s.user.currentBudget.spent ?? 0) + transaction.amount
                    } : s.user.currentBudget;

                    if (updatedBudget && transaction.budgetCategory) {
                        const updatedCategories = updatedBudget.budgetCategories?.map(cat =>
                            cat.id === transaction.budgetCategory.id
                                ? { ...cat, spent: (cat.spent ?? 0) + transaction.amount }
                                : cat
                        );
                        updatedBudget = {
                            ...updatedBudget,
                            budgetCategories: updatedCategories
                        };
                    }

                    let updatedAllTransactions = s.user.allTransactions;
                    if (updatedAllTransactions) {
                        updatedAllTransactions = { ...updatedAllTransactions };
                        const transactionDate = transaction.date.toString();
                        if (updatedAllTransactions[transactionDate]) {
                            updatedAllTransactions[transactionDate] = [...updatedAllTransactions[transactionDate], transaction];
                        } else {
                            updatedAllTransactions[transactionDate] = [transaction];
                        }
                    }

                    const currentTransactions = s.user.lastTransactions || [];
                    if (currentTransactions.length < 3) {
                        return {
                            user: {
                                ...s.user,
                                currentBudget: updatedBudget,
                                lastTransactions: [...currentTransactions, transaction],
                                allTransactions: updatedAllTransactions,
                            },
                        };
                    }
                    const getTimestamp = (t: Transaction) => {
                        return new Date(`${t.date}T${t.time}`).getTime();
                    };
                    const newTimestamp = getTimestamp(transaction);
                    let oldestIndex = 0;
                    let oldestTimestamp = getTimestamp(currentTransactions[0]);
                    for (let i = 1; i < currentTransactions.length; i++) {
                        const timestamp = getTimestamp(currentTransactions[i]);
                        if (timestamp < oldestTimestamp) {
                            oldestTimestamp = timestamp;
                            oldestIndex = i;
                        }
                    }
                    if (newTimestamp > oldestTimestamp) {
                        const updatedTransactions = [...currentTransactions];
                        updatedTransactions[oldestIndex] = transaction;
                        return {
                            user: {
                                ...s.user,
                                currentBudget: updatedBudget,
                                lastTransactions: updatedTransactions,
                                allTransactions: updatedAllTransactions,
                            },
                        };
                    }
                    return {
                        user: {
                            ...s.user,
                            currentBudget: updatedBudget,
                            allTransactions: updatedAllTransactions,
                        },
                    };
                }),
            updateTransaction: (transactionId: number, updatedTransaction: Transaction, old: Transaction | null) =>
                set((s) => {
                    if (!s.user) return s;

                    let updatedBudget = s.user.currentBudget;
                    if (old && s.user.currentBudget) {
                        const amountDifference = updatedTransaction.amount - old.amount;

                        updatedBudget = {
                            ...s.user.currentBudget,
                            spent: (s.user.currentBudget.spent ?? 0) + amountDifference
                        };

                        if (updatedTransaction.budgetCategory) {
                            const updatedCategories = updatedBudget.budgetCategories?.map(cat => {
                                if (old.budgetCategory && cat.id === old.budgetCategory.id && old.budgetCategory.id !== updatedTransaction.budgetCategory.id) {
                                    return { ...cat, spent: (cat.spent ?? 0) - old.amount };
                                }
                                if (cat.id === updatedTransaction.budgetCategory.id) {
                                    const currentSpent = cat.spent ?? 0;
                                    if (old.budgetCategory && old.budgetCategory.id === cat.id) {
                                        return { ...cat, spent: currentSpent + amountDifference };
                                    }
                                    return { ...cat, spent: currentSpent + updatedTransaction.amount };
                                }
                                return cat;
                            });
                            updatedBudget = {
                                ...updatedBudget,
                                budgetCategories: updatedCategories
                            };
                        }
                    }

                    const currentTransactions = s.user.lastTransactions || [];
                    const updatedTransactions = currentTransactions.map(t =>
                        t.id === transactionId ? updatedTransaction : t
                    );

                    let updatedAllTransactions = s.user.allTransactions;
                    if (updatedAllTransactions && old) {
                        updatedAllTransactions = { ...updatedAllTransactions };
                        const oldDate = old.date.toString();
                        const newDate = updatedTransaction.date.toString();

                        if (oldDate !== newDate) {
                            if (updatedAllTransactions[oldDate]) {
                                const filtered = updatedAllTransactions[oldDate].filter(t => t.id !== transactionId);
                                if (filtered.length > 0) {
                                    updatedAllTransactions[oldDate] = filtered;
                                } else {
                                    delete updatedAllTransactions[oldDate];
                                }
                            }
                            if (updatedAllTransactions[newDate]) {
                                updatedAllTransactions[newDate] = [...updatedAllTransactions[newDate], updatedTransaction];
                            } else {
                                updatedAllTransactions[newDate] = [updatedTransaction];
                            }
                        } else {
                            Object.entries(updatedAllTransactions).forEach(([date, transactions]) => {
                                const transactionIndex = transactions.findIndex(t => t.id === transactionId);
                                if (transactionIndex !== -1) {
                                    updatedAllTransactions![date] = transactions.map(t =>
                                        t.id === transactionId ? updatedTransaction : t
                                    );
                                }
                            });
                        }
                    }

                    return {
                        user: {
                            ...s.user,
                            currentBudget: updatedBudget,
                            lastTransactions: updatedTransactions,
                            allTransactions: updatedAllTransactions,
                        },
                    };
                }),
            removeTransaction: (transactionId: number, allTransactions: Transaction[], removedTransaction: Transaction) =>
                set((s) => {
                    if (!s.user) return s;

                    let updatedBudget = s.user.currentBudget ? {
                        ...s.user.currentBudget,
                        spent: (s.user.currentBudget.spent ?? 0) - removedTransaction.amount
                    } : s.user.currentBudget;

                    if (updatedBudget && removedTransaction.budgetCategory) {
                        const updatedCategories = updatedBudget.budgetCategories?.map(cat =>
                            cat.id === removedTransaction.budgetCategory.id
                                ? { ...cat, spent: (cat.spent ?? 0) - removedTransaction.amount }
                                : cat
                        );
                        updatedBudget = {
                            ...updatedBudget,
                            budgetCategories: updatedCategories
                        };
                    }

                    const currentTransactions = s.user.lastTransactions || [];
                    const filteredTransactions = currentTransactions.filter(t => t.id !== transactionId);
                    if (filteredTransactions.length === currentTransactions.length) {
                        return {
                            user: {
                                ...s.user,
                                currentBudget: updatedBudget,
                            },
                        };
                    }
                    if (filteredTransactions.length < 3) {
                        const getTimestamp = (t: Transaction) => {
                            return new Date(`${t.date}T${t.time}`).getTime();
                        };
                        const sortedAll = [...allTransactions].sort((a, b) =>
                            getTimestamp(b) - getTimestamp(a)
                        );
                        const filteredIds = new Set(filteredTransactions.map(t => t.id));
                        const availableTransactions = sortedAll.filter(t => !filteredIds.has(t.id));
                        const neededCount = 3 - filteredTransactions.length;
                        const newTransactions = availableTransactions.slice(0, neededCount);

                        return {
                            user: {
                                ...s.user,
                                currentBudget: updatedBudget,
                                lastTransactions: [...filteredTransactions, ...newTransactions],
                            },
                        };
                    }
                    return {
                        user: {
                            ...s.user,
                            currentBudget: updatedBudget,
                            lastTransactions: filteredTransactions,
                        },
                    };
                }),
            setAllTransactions: (transactions) =>
                set((s) => (s.user ? { user: { ...s.user, allTransactions: transactions } } : s)),
            updateUser: (partial) =>
                set((s) => (s.user ? { user: { ...s.user, ...partial } } : s)),
            clearUser: () => {
                set({ user: null, isUserFetched: false });
                AsyncStorage.removeItem('user-store').catch(() => { });
            },
            setSubscriptions: (subscriptions) =>
                set((s) => (s.user ? { user: { ...s.user, subscriptions } } : s)),
            addSubscription: (subscription) =>
                set((s) => (s.user ? { user: { ...s.user, subscriptions: [...(s.user.subscriptions || []), subscription] } } : s)),
            removeSubscription: (subscription) =>
                set((s) => (s.user ? { user: { ...s.user, subscriptions: (s.user.subscriptions || []).filter(sub => sub.id !== subscription.id) } } : s)),
            updateFirstName: (firstName) =>
                set((s) => (s.user ? { user: { ...s.user, firstName } } : s)),
            updateLastName: (lastName) =>
                set((s) => (s.user ? { user: { ...s.user, lastName } } : s)),
            updateAiTutorialWatched: (watched) =>
                set((s) => (s.user ? { user: { ...s.user, aiTutorialWatched: watched } } : s)),
            updatePremium: (premium) =>
                set((s) => (s.user ? { user: { ...s.user, premium } } : s)),
            updatePremiumUntil: (premiumUntil) =>
                set((s) => (s.user ? { user: { ...s.user, premiumUntil } } : s)),
            updateDailyChatCount: (dailyChatCount) =>
                set((s) => (s.user ? { user: { ...s.user, dailyChatCount } } : s)),
            updateDailyOcrCount: (dailyOcrCount) =>
                set((s) => (s.user ? { user: { ...s.user, dailyOcrCount } } : s)),
            updateUsedChatLimitAt: (usedChatLimitAt) =>
                set((s) => (s.user ? { user: { ...s.user, usedChatLimitAt } } : s)),
            updateUsedOcrLimitAt: (usedOcrLimitAt) =>
                set((s) => (s.user ? { user: { ...s.user, usedOcrLimitAt } } : s)),
            updateFamily: (family) =>
                set((s) => (s.user ? { user: { ...s.user, family } } : s)),
            updateGoals: (goals) =>
                set((s) => (s.user ? { user: { ...s.user, goals } } : s)),
            addGoal: (goal) =>
                set((s) => (s.user ? { user: { ...s.user, goals: [...(s.user.goals || []), goal] } } : s)),
            updateGoal: (goalId, updatedGoal) =>
                set((s) => (s.user ? { user: { ...s.user, goals: s.user.goals?.map(goal => goal.id === goalId ? updatedGoal : goal) } } : s)),
            removeGoal: (goalId) =>
                set((s) => (s.user ? { user: { ...s.user, goals: s.user.goals?.filter(goal => goal.id !== goalId) } } : s)),
        }),
        {
            name: "user-store",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
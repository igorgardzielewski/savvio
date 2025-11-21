// store/userStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {BudgetCategory} from "@/types";

export type Budget = {
    id?: number,
    budgetLimit?: number,
    spent?: number,
    budgetCategories?: BudgetCategory[],
}
export type User = {
    id?: number;
    email?: string;
    name?: string;
    emailVerified? : boolean;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    active?: boolean;
    currentBudget?: Budget;
};

type UserState = {
    user: User | null;
    isUserFetched: boolean;
    setUser: (u: User) => void;
    setCurrentBudget: (budget: Budget) => void;
    updateBudgetCategories: (categories: BudgetCategory[]) => void;
    addBudgetCategory: (category: BudgetCategory) => void;
    updateUser: (partial: Partial<User>) => void;
    clearUser: () => void;
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
                              },
                          }
                        : s
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
            updateUser: (partial) =>
                set((s) => (s.user ? { user: { ...s.user, ...partial } } : s)),
            clearUser: () => {
                set({ user: null, isUserFetched: false });
                // Clear persisted storage to prevent stale data after logout
                AsyncStorage.removeItem('user-store').catch(() => {});
            },
        }),
        {
            name: "user-store",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

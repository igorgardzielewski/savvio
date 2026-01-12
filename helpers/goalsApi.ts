import { useAuthStore } from "@/store/authStore";
import { Goal } from "@/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface GoalHistoryEntry {
    id: number;
    amount: number;
    previousAmount: number;
    newAmount: number;
    note?: string;
    createdAt: string;
}

export interface CreateGoalRequest {
    name: string;
    amount: number;
    currentAmount: number;
    icon_sf_symbol: string;
    color: string;
    startDate: string;
    endDate: string;
}

export interface DepositRequest {
    amount: number;
    note?: string;
}

export const goalsApi = {
    async fetchGoals(): Promise<Goal[]> {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/api/goals`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch goals');
        }

        return res.json();
    },

    async fetchGoal(goalId: number): Promise<Goal> {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/api/goals/${goalId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch goal');
        }

        return res.json();
    },

    async createGoal(goal: CreateGoalRequest): Promise<Goal> {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/api/goals`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(goal),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to create goal');
        }

        return res.json();
    },

    async updateGoal(goalId: number, goal: CreateGoalRequest): Promise<Goal> {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/api/goals/${goalId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(goal),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update goal');
        }

        return res.json();
    },

    async deleteGoal(goalId: number): Promise<boolean> {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/api/goals/${goalId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error('Failed to delete goal');
        }

        return true;
    },

    async depositGoal(goalId: number, deposit: DepositRequest): Promise<Goal> {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/api/goals/${goalId}/deposit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deposit),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to deposit to goal');
        }

        return res.json();
    },

    async fetchGoalHistory(goalId: number): Promise<GoalHistoryEntry[]> {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/api/goals/${goalId}/history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch goal history');
        }

        return res.json();
    },
};

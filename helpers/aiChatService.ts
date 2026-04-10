import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AIBlock {
    type: 'text' | 'column_chart' | 'pie_chart' | 'trend_chart' |
    'report_card' | 'payment_summary' | 'budget_category' |
    'subscription_card' | 'error';
    data: Record<string, any>;
}

export interface AIResponse {
    blocks: AIBlock[];
}

export async function sendChatMessage(
    message: string,
    history: ChatMessage[] = []
): Promise<AIResponse> {
    const token = useAuthStore.getState().token;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            message,
            history,
        }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { ...errorData, status: response.status };
    }

    const data = await response.json() as AIResponse;
    console.log(data);
    return data;
}

export function blocksToHistoryContent(blocks: AIBlock[]): string {
    return JSON.stringify({ blocks });
}

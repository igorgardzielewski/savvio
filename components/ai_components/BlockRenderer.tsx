import BudgetCategoryCard from "@/components/ai_components/BudgetCategoryCard";
import ChatBubble from "@/components/ai_components/ChatBubble";
import ColumnChart from "@/components/ai_components/ColumnChart";
import PaymentSummary from "@/components/ai_components/PaymentSummary";
import PieChart from "@/components/ai_components/PieChart";
import ReportCard from "@/components/ai_components/ReportCard";
import SubscriptionCard from "@/components/ai_components/SubscriptionCard";
import TrendChart from "@/components/ai_components/TrendChart";
import { Text } from "@/components/ui/Text";
import { AIBlock } from "@/helpers/aiChatService";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import React, { useEffect, useRef } from "react";
import { View } from "react-native";

interface BlockRendererProps {
    block: AIBlock;
    onRetry?: () => void;
}

const BlockRenderer = ({ block, onRetry }: BlockRendererProps) => {
    const user = useUserStore((s) => s.user);
    const setAllTransactions = useUserStore((s) => s.setAllTransactions);
    const token = useAuthStore.getState().token;
    const hasFetched = useRef(false);

    const allTransactions = user?.allTransactions
        ? Object.values(user.allTransactions).flat()
        : [];
    const budgetCategories = user?.currentBudget?.budgetCategories || [];
    const subscriptions = user?.subscriptions || [];

    useEffect(() => {
        const fetchTransactionsIfNeeded = async () => {
            if (hasFetched.current) return;
            if (!user) return; // Don't fetch if user is logged out
            if (allTransactions.length > 0) return;
            if (!token) return;

            hasFetched.current = true;

            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/transactions`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && typeof data === 'object') {
                        setAllTransactions(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch transactions in BlockRenderer:', error);
            }
        };

        fetchTransactionsIfNeeded();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    switch (block.type) {
        case 'text':
            return (
                <ChatBubble isUser={false}>
                    {block.data.content}
                </ChatBubble>
            );

        case 'error':
            return <Text>{block.data.message}</Text>;

        case 'column_chart':
            if (!block.data.items || block.data.items.length === 0) return null;
            return (
                <ChatBubble isUser={false} isText={false}>
                    <ColumnChart
                        title={block.data.title}
                        data={block.data.items}
                        accentIndex={block.data.accentIndex}
                        variant="light"
                    />
                </ChatBubble>
            );

        case 'pie_chart':
            if (!block.data.items || block.data.items.length === 0) return null;
            return (
                <ChatBubble isUser={false} isText={false}>
                    <PieChart
                        title={block.data.title}
                        data={block.data.items}
                        variant="light"
                    />
                </ChatBubble>
            );

        case 'trend_chart':
            if (!block.data.items || block.data.items.length === 0) return null;
            return (
                <ChatBubble isUser={false} isText={false}>
                    <TrendChart
                        title={block.data.title}
                        data={block.data.items}
                        variant="light"
                    />
                </ChatBubble>
            );

        case 'report_card':
            if (!block.data.items || block.data.items.length === 0) return null;
            return (
                <ChatBubble isUser={false} isText={false}>
                    <ReportCard
                        title={block.data.title}
                        items={block.data.items}
                        variant="light"
                    />
                </ChatBubble>
            );

        case 'payment_summary': {
            const txs = (block.data.transactionIds || [])
                .map((id: number) => allTransactions.find(t => t.id === id))
                .filter(Boolean);
            if (txs.length === 0) return null;

            return (
                <ChatBubble isUser={false} isText={false}>
                    <View style={{ width: '100%', gap: 12 }}>
                        {block.data.title && (
                            <Text className="font-bold text-base text-[#1a1a2e]">{block.data.title}</Text>
                        )}
                        <PaymentSummary transactions={txs} variant="light" />
                    </View>
                </ChatBubble>
            );
        }

        case 'budget_category': {
            const catsData = block.data.categoryIds || block.data.transactionIds || [];
            const cats = (catsData)
                .map((id: number) => budgetCategories.find(c => c.id === id))
                .filter(Boolean);

            if (cats.length === 0) {
                return null;
            }

            return (
                <ChatBubble isUser={false} isText={false}>
                    <View style={{ width: '100%', gap: 12 }}>
                        {block.data.title && (
                            <Text className="font-bold text-base text-[#1a1a2e]">{block.data.title}</Text>
                        )}
                        <BudgetCategoryCard
                            categories={cats}
                            compact={block.data.compact ?? false}
                        />
                    </View>
                </ChatBubble>
            );
        }

        case 'subscription_card': {
            const subsData = block.data.subscriptionIds || block.data.transactionIds || [];
            const subs = (subsData)
                .map((id: number) => subscriptions.find(s => s.id === id))
                .filter(Boolean);

            if (subs.length === 0) return null;

            return (
                <ChatBubble isUser={false} isText={false}>
                    <View style={{ width: '100%', gap: 12 }}>
                        {block.data.title && (
                            <Text className="font-bold text-base text-[#1a1a2e]">{block.data.title}</Text>
                        )}
                        <SubscriptionCard
                            subscriptions={subs}
                            compact={block.data.compact ?? true}
                        />
                    </View>
                </ChatBubble>
            );
        }

        default:
            return null;
    }
};

export default BlockRenderer;

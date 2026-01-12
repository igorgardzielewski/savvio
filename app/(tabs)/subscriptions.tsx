import { AddSubscriptionModal } from "@/components/AddSubscriptionModal";
import DeleteSubscriptionModal from "@/components/DeleteSubscriptionModal";
import { Text } from '@/components/ui/Text';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getLogoSource } from "@/helpers/imageHelpers";
import { useUserStore } from '@/store/userStore';
import { Subscription } from "@/types";
import { Image } from 'expo-image';
import React from "react";
import {
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
const EmptyTransactionDot = () => {
    return (
        <View className="bg-white/20 rounded-full p-2">
            <IconSymbol name="circle.dashed" color="white" weight={'semibold'} size={24} />
        </View>
    )
}
const TransactionDot = ({ color }: { color: string }) => {
    return (
        <View className="bg-white rounded-full p-2">
            <IconSymbol name="checkmark.circle.fill" color={color} weight={'semibold'} size={24} />
        </View>
    )
}
export default function Subscriptions() {
    const [addSubscriptionModalVisible, setAddSubscriptionModalVisible] = React.useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = React.useState<boolean>(false);
    const [selectedSubscription, setSelectedSubscription] = React.useState<Subscription | null>(null);
    const { user, addSubscription, removeSubscription, addTransaction } = useUserStore();
    const subscriptions = user?.subscriptions || [];
    const [expandedSubscription, setExpandedSubscription] = React.useState<{ [key: string]: boolean }>({});
    const handleLongPress = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setDeleteModalVisible(true);
    };

    const handleDeleteSuccess = (subscription: Subscription) => {
        removeSubscription(subscription);
        setSelectedSubscription(null);
    };

    const createTransactions = (subscription: Subscription) => {
        const nextPaymentDate = new Date(subscription.paymentDate);

        const getDateWithOffset = (baseDate: Date, offsetIndex: number, period: string): Date => {
            const date = new Date(baseDate);
            if (period === "MONTHLY") {
                date.setMonth(date.getMonth() + offsetIndex);
            } else if (period === "YEARLY") {
                date.setFullYear(date.getFullYear() + offsetIndex);
            }
            return date;
        };

        const formatDate = (date: Date) => date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });

        const sortedTransactions = [...subscription.transactions].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const transactionCount = subscription.transactions.length;
        const pastCount = Math.min(transactionCount, 2);
        const futureCount = 4 - pastCount;

        const pastTransactions = sortedTransactions.slice(0, pastCount).reverse();

        const renderDot = (isPast: boolean, date: Date, index: number, isFirst: boolean) => (
            <React.Fragment key={`${isPast ? 'past' : 'future'}-${index}`}>
                {!isFirst && (
                    <View className="flex-1 h-[2px] bg-white/50 mt-[19px]" />
                )}
                <View className="flex-col items-center">
                    {isPast ? <TransactionDot color={subscription.color} /> : <EmptyTransactionDot />}
                    <Text className="text-white text-xs mt-1">
                        {formatDate(date)}
                    </Text>
                </View>
            </React.Fragment>
        );

        const lastPaidDate = pastTransactions.length > 0
            ? new Date(pastTransactions[pastTransactions.length - 1].date)
            : new Date(nextPaymentDate);

        const baseDateForFuture = new Date(lastPaidDate);

        return (
            <View className="flex-row items-start">
                {pastTransactions.map((transaction, index) =>
                    renderDot(true, new Date(transaction.date), index, index === 0)
                )}
                {Array.from({ length: futureCount }).map((_, index) =>
                    renderDot(false, getDateWithOffset(baseDateForFuture, index + 1, subscription.period), index, pastCount === 0 && index === 0)
                )}
            </View>
        );
    }
    return (
        <>
            <ScrollView
                className="flex-1 bg-[#f2f0ff]"
                contentContainerStyle={{
                    paddingHorizontal: 8,
                    paddingTop: 12,
                    paddingBottom: 100,
                    gap: 12,
                    justifyContent: 'flex-start'
                }}
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <TouchableOpacity className={`bg-[#6b5aed] rounded-[24px] gap-6 px-6 pt-6 pb-16`}
                        onPress={() => setAddSubscriptionModalVisible(true)
                        }>
                        <View className={`flex-row items-center justify-between `}>
                            <Text className="text-white text-2xl font-semibold">Add a subscription</Text>
                            <View className="bg-white rounded-full p-6">
                                <IconSymbol name="plus" color="#6b5aed" weight={'semibold'} size={24} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    {subscriptions.map((subscription, index) => (
                        <TouchableOpacity key={`subscription-${subscription.id}`} onLongPress={() => handleLongPress(subscription)} activeOpacity={0.7} onPress={() => setExpandedSubscription(!expandedSubscription[subscription.id] ? { ...expandedSubscription, [subscription.id]: true } : { ...expandedSubscription, [subscription.id]: false })}>
                            <View className={'rounded-[24px] -mt-10'} style={{ backgroundColor: subscription.color }}>
                                <View className={`pt-6 px-6 ${index === subscriptions.length - 1 ? 'pb-6' : 'pb-12'}`}>
                                    <View className="flex-row justify-between">
                                        <View className={'flex flex-col gap-2 justify-between'}>
                                            <Text className="text-white text-2xl font-bold">{subscription.shop.name}</Text>
                                            <Text className={'bg-white text-black px-4 py-2 rounded-full font-semibold self-start'}>
                                                <Text className={'text-lg'}>{parseFloat(subscription.price).toFixed(2)}/</Text>
                                                <Text className={'text-sm text-gray-500'}>{subscription.period.toLowerCase()}</Text>
                                            </Text>
                                        </View>
                                        <View className={'flex flex-col gap-2 items-end'}>
                                            <View className={'bg-white p-2 rounded-full items-center justify-center'}>
                                                <View className="bg-white rounded-full items-center justify-center overflow-hidden" style={{ width: 48, height: 48 }}>
                                                    <Image
                                                        source={getLogoSource(subscription.shop.logoUrl)}
                                                        style={{ width: 48, height: 48 }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            </View>
                                            <Text className={'bg-white/80 text-black p-2 rounded-full font-semibold'}>
                                                <Text className={'text-xs'}>{subscription.paymentDate}</Text>
                                            </Text>
                                        </View>
                                    </View>
                                    {expandedSubscription[subscription.id] && subscription.period === 'MONTHLY' && (
                                        <View className="my-6 -px-6">
                                            {createTransactions(subscription)}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <AddSubscriptionModal
                visible={addSubscriptionModalVisible}
                onClose={() => setAddSubscriptionModalVisible(false)}
                addSubscription={addSubscription}
                addTransaction={addTransaction}
            />
            <DeleteSubscriptionModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                subscription={selectedSubscription}
                onDeleteSuccess={handleDeleteSuccess}
            />
        </>
    );
}
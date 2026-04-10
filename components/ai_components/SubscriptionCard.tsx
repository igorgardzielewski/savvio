import { Text } from "@/components/ui/Text";
import { getLogoSource } from "@/helpers/imageHelpers";
import { Subscription } from "@/types";
import { Image, View } from "react-native";

interface SubscriptionCardProps {
    subscription?: Subscription;
    subscriptions?: Subscription[];
    compact?: boolean;
}

const SubscriptionCard = ({ subscription, subscriptions, compact = false }: SubscriptionCardProps) => {
    // If subscriptions array is provided, render list
    if (subscriptions && subscriptions.length > 0) {
        return (
            <View style={{ width: '100%', gap: 12 }}>
                {subscriptions.map((sub) => (
                    <SubscriptionCardItem key={sub.id} subscription={sub} compact={compact} />
                ))}
            </View>
        );
    }

    // Single subscription
    if (subscription) {
        return <SubscriptionCardItem subscription={subscription} compact={compact} />;
    }

    return null;
}

const SubscriptionCardItem = ({ subscription, compact }: { subscription: Subscription; compact: boolean }) => {
    const paymentDate = new Date(subscription.paymentDate);
    const now = new Date();
    const diffTime = paymentDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const periodLabel = subscription.period === 'MONTHLY' ? '/month' :
        subscription.period === 'YEARLY' ? '/year' : 'one-time';

    if (compact) {
        return (
            <View
                className="flex-row items-center p-3 rounded-2xl min-w-[100%]"
                style={{ backgroundColor: subscription.color + '15' }}
            >
                <View className="w-10 h-10 rounded-full overflow-hidden bg-white items-center justify-center mr-3">
                    <Image
                        source={getLogoSource(subscription.shop.logoUrl)}
                        className="w-10 h-10"
                        resizeMode="cover"
                    />
                </View>
                <View className="flex-1">
                    <Text className="font-semibold text-[#1a1a2e]">{subscription.shop.name}</Text>
                    <Text className="text-xs text-[#1a1a2e]/60">{periodLabel}</Text>
                </View>
                <View className="items-end">
                    <Text className="font-bold text-[#f87171]">
                        {parseFloat(subscription.price).toFixed(2)} zł
                    </Text>
                    {diffDays > 0 && (
                        <Text className="text-xs text-[#1a1a2e]/50">in {diffDays}d</Text>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View
            className="relative flex flex-row justify-between items-center rounded-[24px] p-4 overflow-hidden min-w-[100%]"
            style={{
                backgroundColor: subscription.color,
                minHeight: 80,
                width: '100%'
            }}
        >
            <View className="flex flex-col gap-1">
                <Text className="text-white font-bold text-xl">
                    {subscription.shop.name}
                </Text>
                <Text className="text-white/70 text-sm">
                    {parseFloat(subscription.price).toFixed(2)} zł {periodLabel}
                </Text>
            </View>

            <View className="bg-white p-2 rounded-full items-center justify-center">
                <View className="bg-white rounded-full items-center justify-center overflow-hidden" style={{ width: 48, height: 48 }}>
                    <Image
                        source={getLogoSource(subscription.shop.logoUrl)}
                        style={{ width: 48, height: 48 }}
                        resizeMode="cover"
                    />
                </View>
            </View>

            {diffDays > 0 && diffDays <= 7 && (
                <View className="absolute top-2 right-2 bg-white/20 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">in {diffDays}d</Text>
                </View>
            )}
        </View>
    );
}

export default SubscriptionCard;

import { getLogoSource } from "@/helpers/imageHelpers";
import { ReportSubscriptionsSummary } from "@/types";
import { Image } from "expo-image";
import React from "react";
import { ScrollView, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Text } from "../ui/Text";

interface SubscriptionsSummaryProps {
    subscriptionsSummary: ReportSubscriptionsSummary;
}

export default function SubscriptionsSummary({ subscriptionsSummary }: SubscriptionsSummaryProps) {
    const pieData = subscriptionsSummary.subscriptions.map((sub) => ({
        value: sub.price,
        color: sub.color || '#6b5aed',
        text: '',
    }));

    const hasData = pieData.length > 0;
    const chartData = hasData ? pieData : [{ value: 1, color: '#f3f4f6' }];

    const CenterLabel = () => (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text className="text-gray-400 text-xs font-medium uppercase text-center mb-1">Total</Text>
            <Text className="text-[#1e1b3a] text-3xl font-bold text-center">
                {subscriptionsSummary.totalMonthly.toFixed(2)} zł
            </Text>
        </View>
    );

    return (
        <View className="w-full flex-1" >
            <View className="items-center justify-center my-6 relative">
                <PieChart
                    data={chartData}
                    donut
                    radius={140}
                    innerRadius={105}
                    innerCircleColor={'white'}
                    centerLabelComponent={CenterLabel}
                    strokeWidth={2}
                    strokeColor="white"
                />
            </View>

            <ScrollView className="w-full px-2 gap-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {subscriptionsSummary.subscriptions.map((sub, index) => (
                    <View key={index} className="flex-row items-center justify-between bg-white rounded-[20px] p-4 border border-gray-100">
                        <View className="flex-row items-center gap-4">
                            <Image
                                source={getLogoSource(sub.logoUrl)}
                                style={{ width: 44, height: 44, borderRadius: 14 }}
                                contentFit="cover"
                            />
                            <View>
                                <Text className="text-[#1e1b3a] font-bold text-base">{sub.name}</Text>
                                <View className="flex-row items-center gap-2">
                                    <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color || '#6b5aed' }} />
                                    <Text className="text-gray-400 text-xs font-medium uppercase">{sub.period}</Text>
                                </View>
                            </View>
                        </View>
                        <Text className="text-[#1e1b3a] font-bold text-lg">{sub.price.toFixed(2)} zł</Text>
                    </View>
                ))}

                {!hasData && (
                    <Text className="text-gray-400 text-center mt-4">No active subscriptions found.</Text>
                )}
            </ScrollView>
        </View>
    );
}
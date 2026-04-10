import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from '@/components/ui/Text';
import { ReportComparison } from "@/types";
import React from "react";
import { ScrollView, View } from 'react-native';

interface BudgetComparisonProps {
    comparison: ReportComparison;
    aiTip?: string | null;
}

export default function BudgetComparison({ comparison, aiTip }: BudgetComparisonProps) {
    const isIncrease = comparison.spendingChange > 0;
    const isDecrease = comparison.spendingChange < 0;
    const isEqual = comparison.spendingChange === 0;

    const compareToText = comparison.compareTo === "PREVIOUS_MONTH"
        ? "Previous Month"
        : "Actual Month";

    const iconBox = { width: 44, height: 44, borderRadius: 14, alignItems: 'center' as const, justifyContent: 'center' as const };

    return (
        <ScrollView className="w-full mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
                <View className={'flex flex-col justify-center'}>
                    <Text className={'text-gray-400 text-lg font-medium'}>Comparing to <Text className={'text-[#1e1b3a] text-lg font-bold'}>{compareToText.toLowerCase()}</Text></Text>
                </View>

            <View className={'flex flex-row items-center px-5 w-full bg-white rounded-3xl gap-4 border border-gray-200'} style={{ height: 96 }}>
                <View style={[iconBox, { backgroundColor: '#f0f9ff' }]}>
                    <IconSymbol name={"clock"} color={'#3b82f6'} size={22} />
                </View>
                <View className={'flex flex-col justify-center'}>
                    <Text className={'text-gray-400 text-sm font-medium'}>Previous Budget Spent</Text>
                    <Text className={'text-[#1e1b3a] text-2xl font-bold'}>{comparison.previousBudgetSpent.toFixed(2)} zł</Text>
                </View>
            </View>

            {isIncrease && (
                <View className={'flex flex-row items-center px-5 w-full rounded-3xl gap-4 border border-gray-200'} style={{ height: 96, backgroundColor: '#fef2f2' }}>
                    <View style={[iconBox, { backgroundColor: '#fee2e2' }]}>
                        <IconSymbol name={"arrow.up"} color={'#ef4444'} size={22} />
                    </View>
                    <View className={'flex-1 flex flex-col justify-center'}>
                        <Text className={'text-red-300 text-sm font-medium'}>Spending Change</Text>
                        <Text className={'text-red-500 text-2xl font-bold'}>+{comparison.spendingChange.toFixed(2)} zł</Text>
                    </View>
                </View>
            )}

            {isDecrease && (
                <View className={'flex flex-row items-center px-5 w-full rounded-3xl gap-4 border border-gray-200'} style={{ height: 96, backgroundColor: '#ecfdf5' }}>
                    <View style={[iconBox, { backgroundColor: '#d1fae5' }]}>
                        <IconSymbol name={"arrow.down"} color={'#10b981'} size={22} />
                    </View>
                    <View className={'flex-1 flex flex-col justify-center'}>
                        <Text className={'text-emerald-400 text-sm font-medium'}>Spending Change</Text>
                        <Text className={'text-emerald-600 text-2xl font-bold'}>{comparison.spendingChange.toFixed(2)} zł</Text>
                    </View>
                </View>
            )}

            {isEqual && (
                <View className={'flex flex-row items-center px-5 w-full rounded-3xl gap-4 border border-gray-200'} style={{ height: 96, backgroundColor: '#f9fafb' }}>
                    <View style={[iconBox, { backgroundColor: '#e5e7eb' }]}>
                        <IconSymbol name={"minus"} color={'#6b7280'} size={22} />
                    </View>
                    <View className={'flex-1 flex flex-col justify-center'}>
                        <Text className={'text-gray-400 text-sm font-medium'}>Spending Change</Text>
                        <Text className={'text-gray-600 text-2xl font-bold'}>No change</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}


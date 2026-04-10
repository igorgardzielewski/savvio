import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from '@/components/ui/Text';
import { ReportBudgetSummary } from "@/types";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { Animated, ScrollView, View } from 'react-native';

interface Props {
    setStep: (step: number) => void;
    budgetSummary: ReportBudgetSummary;
}

export default function BudgetSummary({ setStep, budgetSummary }: Props) {
    const lightBulbTimeoutRef = React.useRef<number | null>(null);
    const opacity = React.useRef(new Animated.Value(1)).current;
    const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        animationRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        animationRef.current.start();

        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
            }
            if (lightBulbTimeoutRef.current !== null) {
                clearTimeout(lightBulbTimeoutRef.current);
            }
        };
    }, [setStep]);

    const iconBox = { width: 44, height: 44, borderRadius: 14, alignItems: 'center' as const, justifyContent: 'center' as const };

    return (
        <ScrollView className="w-full mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
            <View className={'flex flex-row items-center px-5 w-full bg-white rounded-3xl gap-4 border border-gray-200'} style={{ height: 96 }}>
                <View style={[iconBox, { backgroundColor: '#ebe9fc' }]}>
                    <IconSymbol name={"calendar"} color={'#6b5aed'} size={22} />
                </View>
                <View className={'flex flex-col justify-center'}>
                    <Text className={'text-gray-400 text-sm font-medium'}>Budget Period</Text>
                    <Text className={'text-[#1e1b3a] text-lg font-bold'}>{budgetSummary.dateStart} — {budgetSummary.dateEnd}</Text>
                </View>
            </View>

            <View className={'flex flex-row items-center px-5 w-full bg-white rounded-3xl gap-4 border border-gray-200'} style={{ height: 96 }}>
                <View style={[iconBox, { backgroundColor: '#ebe9fc' }]}>
                    <IconSymbol name={"dollarsign.gauge.chart.lefthalf.righthalf"} color={'#6b5aed'} size={22} />
                </View>
                <View className={'flex flex-col justify-center'}>
                    <Text className={'text-gray-400 text-sm font-medium'}>Planned Budget</Text>
                    <Text className={'text-[#1e1b3a] text-2xl font-bold'}>{budgetSummary.budgetLimit.toFixed(2)} zł</Text>
                </View>
            </View>

            <View className={'flex flex-row items-center px-5 w-full bg-white rounded-3xl gap-4 border border-gray-200'} style={{ height: 96 }}>
                <View style={[iconBox, { backgroundColor: '#fef2f2' }]}>
                    <IconSymbol name={"cart"} color={'#f87171'} size={22} />
                </View>
                <View className={'flex-1 flex flex-col justify-center'}>
                    <Text className={'text-gray-400 text-sm font-medium'}>Total Spent</Text>
                    <Text className={'text-[#f87171] text-2xl font-bold'}>{budgetSummary.totalSpent.toFixed(2)} zł</Text>
                </View>
                <View className={'bg-[#ebe9fc] rounded-xl px-3 py-1.5'}>
                    <Text className={'text-[#6b5aed] text-xs font-bold'}>{budgetSummary.percentageUsed.toFixed(1)}%</Text>
                </View>
            </View>

            {budgetSummary.remaining >= 0 ?
                <View className={'flex flex-row items-center px-5 w-full rounded-3xl gap-4 border border-gray-200'} style={{ height: 96, backgroundColor: '#ecfdf5' }}>
                    <View style={[iconBox, { backgroundColor: '#d1fae5' }]}>
                        <IconSymbol name={"checkmark"} color={'#10b981'} size={22} />
                    </View>
                    <View className={'flex flex-col justify-center'}>
                        <Text className={'text-emerald-400 text-sm font-medium'}>Remaining</Text>
                        <Text className={'text-emerald-600 text-2xl font-bold'}>{budgetSummary.remaining.toFixed(2)} zł left</Text>
                    </View>
                </View> :
                <View className={'flex flex-row items-center px-5 w-full rounded-3xl gap-4 border border-gray-200'} style={{ height: 96, backgroundColor: '#fef2f2' }}>
                    <View style={[iconBox, { backgroundColor: '#fee2e2' }]}>
                        <IconSymbol name={"xmark"} color={'#ef4444'} size={22} />
                    </View>
                    <View className={'flex flex-col justify-center'}>
                        <Text className={'text-red-300 text-sm font-medium'}>Over Budget</Text>
                        <Text className={'text-red-500 text-2xl font-bold'}>{Math.abs(budgetSummary.remaining).toFixed(2)} zł over</Text>
                    </View>
                </View>
            }

            <View className={'flex flex-row items-center w-full gap-3'}>
                <View className={'flex-1 flex flex-row items-center px-4 bg-white rounded-3xl gap-3 border border-gray-200'} style={{ height: 96 }}>
                    <View style={[iconBox, { backgroundColor: '#ebe9fc', width: 40, height: 40, borderRadius: 12 }]}>
                        <IconSymbol name={"number"} color={'#6b5aed'} size={18} />
                    </View>
                    <View className={'flex flex-col justify-center'}>
                        <Text className={'text-gray-400 text-xs font-medium'}>Transactions</Text>
                        <Text className={'text-[#1e1b3a] text-xl font-bold'}>{budgetSummary.transactionCount}</Text>
                    </View>
                </View>
                <View className={'flex-1 flex flex-row items-center px-4 bg-white rounded-3xl gap-3 border border-gray-200'} style={{ height: 96 }}>
                    <View style={[iconBox, { backgroundColor: '#ebe9fc', width: 40, height: 40, borderRadius: 12 }]}>
                        <IconSymbol name={"percent"} color={'#6b5aed'} size={18} />
                    </View>
                    <View className={'flex flex-col justify-center'}>
                        <Text className={'text-gray-400 text-xs font-medium'}>Budget Used</Text>
                        <Text className={'text-[#1e1b3a] text-xl font-bold'}>{budgetSummary.percentageUsed.toFixed(1)}%</Text>
                    </View>
                </View>
            </View>

            {budgetSummary.aiTip && (
                <View className={'flex flex-row gap-3 w-full items-start'}>
                    <Image source={require("@/assets/images/aibuddy4.png")} style={{ width: 64, height: 64 }} />
                    <View className={'flex-1 flex flex-row items-center px-4 bg-white rounded-3xl py-4 border border-gray-200'}>
                        <Text className={'flex-shrink text-[#414054] text-sm leading-5'}>{budgetSummary.aiTip}</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

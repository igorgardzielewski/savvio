import { ReportCategoryBreakdown } from "@/types";
import { Image } from "expo-image";
import { SFSymbol } from "expo-symbols";
import React from "react";
import { ScrollView, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";
import { Text } from "../ui/Text";

interface CategoryBreakdownProps {
    categoryBreakdown: ReportCategoryBreakdown[];
    categoryBreakdownAiTip: string | null;
}

export default function CategoryBreakdown({ categoryBreakdown, categoryBreakdownAiTip }: CategoryBreakdownProps) {
    return (
        <ScrollView className="w-full mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, gap: 12 }}>
            {categoryBreakdown.map((category, index) => {
                const percentageSpent = category.allocated > 0
                    ? (category.spent / category.allocated) * 100
                    : 0;

                const isOver = percentageSpent > 100;

                return (
                    <View key={index} className="flex flex-row border border-gray-100 rounded-[24px] bg-white shadow-sm shadow-gray-100 overflow-hidden">
                        <View
                            className="relative flex flex-col justify-between p-4 overflow-hidden w-[38%]"
                            style={{
                                backgroundColor: category.color,
                                minHeight: 120,
                            }}
                        >
                            <View>
                                <Text className="text-white font-bold text-lg leading-6 pr-1">
                                    {category.name}
                                </Text>
                                <Text className="text-white/80 text-xs mt-1 font-medium">
                                    {percentageSpent.toFixed(1)}% used
                                </Text>
                            </View>

                            <View className="absolute -right-3 -bottom-3 opacity-20">
                                <IconSymbol
                                    name={category.iconUri as SFSymbol}
                                    size={80}
                                    color="white"
                                />
                            </View>
                        </View>

                        <View className="flex-1 p-4 justify-between">
                            <View>
                                <Text className="text-gray-400 text-xs uppercase font-semibold mb-0.5">Spent</Text>
                                <View className="flex flex-row items-end">
                                    <Text className={`text-2xl font-bold ${percentageSpent > 100 ? 'text-red-400' : 'text-[#1e1b3a]'}`}>{category.spent.toFixed(2)} zł/</Text>
                                    <Text className={"text-gray-400 text-base font-bold"}>{category.allocated.toFixed(2)} zł</Text>
                                </View>
                            </View>

                            <View className="flex flex-row justify-between">
                                <View>
                                    <Text className="text-gray-400 text-xs font-medium">Transactions</Text>
                                    <Text className="text-gray-600 font-semibold">{category.transactionCount}</Text>
                                </View>
                            </View>

                            {isOver && (
                                <View className="mt-2 bg-red-50 px-2 py-1 rounded-lg self-start">
                                    <Text className="text-red-500 text-[10px] font-bold uppercase">Over Budget</Text>
                                </View>
                            )}
                        </View>
                    </View>
                );
            })}
            {categoryBreakdownAiTip && (
                <View className={'flex flex-row gap-3 w-full items-start'}>
                    <Image source={require("@/assets/images/aibuddy4.png")} style={{ width: 64, height: 64 }} />
                    <View className={'flex-1 flex flex-row items-center px-4 bg-white rounded-3xl py-4 border border-gray-200'}>
                        <Text className={'flex-shrink text-[#414054] text-sm leading-5'}>{categoryBreakdownAiTip}</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}
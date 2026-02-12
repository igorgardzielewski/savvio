import { getLogoSource } from "@/helpers/imageHelpers";
import { getShopIcon } from "@/helpers/shopCategoryHelpers";
import { ReportTopExpense } from "@/types";
import { Image } from "expo-image";
import React from "react";
import { ScrollView, View } from "react-native";
import { SFSymbols6_0 } from "sf-symbols-typescript";
import { Text } from "../ui/Text";
import { IconSymbol } from "../ui/icon-symbol";
interface TopExpensesProps {
    topExpenses: ReportTopExpense[];
}

export default function TopExpenses({ topExpenses }: TopExpensesProps) {
    return (
        <View className="flex-1 w-full items-center justify-center">
            <ScrollView
                horizontal
                className="w-full pl-6"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingRight: 32,
                    gap: 16,
                    alignItems: 'center',
                    flexGrow: 1,
                    justifyContent: 'center',
                }}
            >
                {topExpenses.map((expense, index) => {
                    return (
                        <View
                            key={index}
                            className="bg-white rounded-[32px] p-6 items-center justify-between border border-gray-100 shadow-sm shadow-gray-100"
                            style={{ width: 240, height: 'auto' }}
                        >
                            <View className="absolute top-4 right-4 bg-gray-50 rounded-full w-8 h-8 items-center justify-center z-10">
                                <Text className="text-[#a78bfa] font-bold text-sm">#{index + 1}</Text>
                            </View>
                            <View className="mt-6 shadow-sm">
                                <Image
                                    source={getLogoSource(expense.shop.logoUrl)}
                                    style={{ width: 90, height: 90, borderRadius: 28 }}
                                    contentFit="cover"
                                />
                            </View>
                            <View className="items-center gap-1 w-full">
                                <Text className="text-[#1e1b3a] text-xl font-bold text-center w-full" numberOfLines={1}>
                                    {expense.shop.name}
                                </Text>
                                <Text className="text-gray-400 text-sm font-medium">
                                    {expense.date}
                                </Text>
                            </View>
                            <View className="mb-4">
                                <Text className="text-[#1e1b3a] text-3xl font-bold">
                                    {expense.amount.toFixed(2)} zł
                                </Text>
                            </View>
                            <View className={'flex flex-col items-center justify-center gap-4 w-full'}>
                                {expense?.budgetCategoryShort &&
                                    <View className="flex flex-row items-center justify-start gap-2 px-4 py-3 rounded-full"
                                        style={{ backgroundColor: expense.budgetCategoryShort.color }}
                                    >
                                        <IconSymbol name={expense.budgetCategoryShort.iconUri as SFSymbols6_0} color={'white'} size={20} style={{ opacity: 1 }} />
                                        <Text className={'text-white font-bold'}>{expense.budgetCategoryShort.name}</Text>
                                    </View>}
                                <View className="flex flex-row items-center justify-start gap-2 px-4 py-3 rounded-full" style={{ backgroundColor: expense.shop.categoryColor || '#72c7aa' }}>
                                    {expense.shop.categoryName && <IconSymbol name={getShopIcon(expense.shop.categoryName) as SFSymbols6_0} color={'white'} size={20} style={{ opacity: 1 }} />}
                                    {expense.shop.categoryName && <Text className={'text-white font-bold'}>{expense.shop.categoryName}</Text>}
                                </View>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
import BudgetComparison from "@/components/report/BudgetComparison";
import BudgetSummary from "@/components/report/BudgetSummary";
import CategoryBreakdown from "@/components/report/CategoryBreakdown";
import DailySpending from "@/components/report/DailySpending";
import GoalsSummary from "@/components/report/GoalsSummary";
import ReportPagination from "@/components/report/ReportPagination";
import SubscriptionsSummary from "@/components/report/SubscriptionsSummary";
import TopExpenses from "@/components/report/TopExpenses";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from '@/components/ui/Text';
import { BudgetReport } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportPage() {
    const [step, setStep] = React.useState(0);
    useEffect(() => {
        if (step >= 7) setStep(0);
    }, [step]);
    const router = useRouter()
    const params = useLocalSearchParams();
    const stepsTitles = ['Budget Summary', 'Category Breakdown', 'Top Expenses', 'Daily Spending', 'Subscriptions', 'Goals', 'Comparison'];
    const report: BudgetReport = params.reportData ? JSON.parse(params.reportData as string) : null;
    return (
        <View
            className="w-full h-full bg-white"
        >
            <SafeAreaView className="w-full h-full flex items-center justify-between px-4" edges={['top', 'bottom']}>
                {/*topview*/}
                <View className="flex flex-row items-center gap-4 w-full h-16">
                    <TouchableOpacity onPress={() => router.push('/(tabs)/budget')} activeOpacity={0.5}>
                        <View className={'bg-[#ebe9fc] p-4 rounded-full'}>
                            <IconSymbol name="xmark" size={24} weight={'bold'} color="#7b62f6" />
                        </View>
                    </TouchableOpacity>
                    <Text className={'text-[#1e1b3a] font-bold text-2xl'}>{stepsTitles[step]}</Text>
                </View>
                {step === 0 && <BudgetSummary setStep={setStep} budgetSummary={report.budgetSummary} />}
                {step === 1 && <CategoryBreakdown categoryBreakdown={report.categoryBreakdown} categoryBreakdownAiTip={report.categoryBreakdownAiTip} />}
                {step === 2 && <TopExpenses topExpenses={report.topExpenses} />}
                {step === 3 && <DailySpending dailySpending={report.dailySpending} startDate={report.budgetSummary.dateStart} endDate={report.budgetSummary.dateEnd} aiTip={report.dailySpendingAiTip || ''} />}
                {step === 4 && <SubscriptionsSummary subscriptionsSummary={report.subscriptionsSummary} />}
                {step === 5 && <GoalsSummary goalsSummary={report.goalsSummary} />}
                {step === 6 && <BudgetComparison comparison={report.comparison} />}
                <View className={'flex flex-row items-center justify-between w-full py-4 border-t-gray-200 border-t'}>
                    {step > 0 ? (
                        <TouchableOpacity onPress={() => setStep(s => s - 1)} activeOpacity={0.5}>
                            <View className={'bg-[#ebe9fc] p-4 rounded-full'}>
                                <IconSymbol name="arrow.left" size={24} weight={'bold'} color="#7b62f6" />
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 56 }} />
                    )}

                    <ReportPagination currentStep={step} maxSteps={stepsTitles.length} />

                    {step === stepsTitles.length - 1 ? (
                        <TouchableOpacity onPress={() => router.push('/(tabs)/budget')} activeOpacity={0.5}>
                            <View className={'bg-[#ebe9fc] px-5 py-4 rounded-full'}>
                                <Text className={'font-bold text-base text-[#7b62f6] text-center'}>Finish</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setStep(s => s + 1)} activeOpacity={0.5}>
                            <View className={'bg-[#ebe9fc] p-4 rounded-full'}>
                                <IconSymbol name="arrow.right" size={24} weight={'bold'} color="#7b62f6" />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
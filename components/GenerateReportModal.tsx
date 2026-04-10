import { Text } from "@/components/ui/Text";
import { formatMonthYear } from "@/helpers/timeHelper";
import { Budget, useUserStore } from "@/store/userStore";
import React, { useMemo } from "react";
import { ActivityIndicator, Modal, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface GenerateReportModalProps {
    visible: boolean;
    onClose: () => void;
    onGenerate: (budget: Budget) => void;
    isLoading?: boolean;
}

export default function GenerateReportModal({ visible, onClose, onGenerate,isLoading }: GenerateReportModalProps) {
    const user = useUserStore((s) => s.user);
    const [selectedBudgetId, setSelectedBudgetId] = React.useState<number | null>(null);
    const [generating, setGenerating] = React.useState(false);

    const allBudgets = useMemo(() => {
        const budgets: Budget[] = [];
        if (user?.currentBudget) {
            budgets.push(user.currentBudget);
        }
        if (user?.previousBudgets) {
            budgets.push(...user.previousBudgets);
        }
        return budgets;
    }, [user?.currentBudget, user?.previousBudgets]);

    const handleGenerate = () => {
        const budget = allBudgets.find((b) => b.id === selectedBudgetId);
        if (!budget) return;
        onGenerate(budget);
    };

    const handleClose = () => {
        if (generating) return;
        setSelectedBudgetId(null);
        onClose();
    };

    const getPercentageSpent = (budget: Budget) => {
        const spent = budget.spent ?? 0;
        const limit = budget.budgetLimit ?? 0;
        
        if (limit === 0 && spent > 0) {
            return 100;
        }
        
        if (limit === 0) {
            return 0;
        }
        
        return (spent / limit) * 100;
    };

    const isOverBudget = (budget: Budget) => {
        const spent = budget.spent ?? 0;
        const limit = budget.budgetLimit ?? 0;
        
        if (limit === 0 && spent > 0) {
            return true;
        }
        
        if (limit > 0 && spent > limit) {
            return true;
        }
        
        return false;
    };

    const isCurrentBudget = (budget: Budget) => {
        return user?.currentBudget?.id === budget.id;
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>

                <SafeAreaView edges={['bottom']}>
                    <View style={{ margin: 8, backgroundColor: 'white', borderRadius: 40, paddingBottom: 24, paddingTop: 24, paddingHorizontal: 24 }}>
                        <View style={{ minHeight: 200, justifyContent: isLoading ? 'center' : 'flex-start' }}>
                            {isLoading ? (
                                <View style={{ alignItems: 'center', gap: 16 }}>
                                    <ActivityIndicator size="large" color="#6b5aed" />
                                </View>
                            ) : (
                                <>
                                    <View style={{ alignItems: 'center', paddingBottom: 20 }}>
                                        <Text className="text-xl font-bold text-black">Generate Report</Text>
                                    </View>

                                    <ScrollView
                                        style={{ maxHeight: 280 }}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 10 }}
                                    >
                                        {allBudgets.length === 0 ? (
                                            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                                <Text className="text-gray-400 text-base">No budgets available</Text>
                                            </View>
                                        ) : (
                                            allBudgets.map((budget) => {
                                                const isSelected = selectedBudgetId === budget.id;
                                                const percentage = getPercentageSpent(budget);
                                                const isOver = isOverBudget(budget);
                                                const isCurrent = isCurrentBudget(budget);

                                                return (
                                                    <TouchableOpacity
                                                        key={budget.id}
                                                        onPress={() => setSelectedBudgetId(budget.id ?? null)}
                                                        activeOpacity={0.7}
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            padding: 12,
                                                            borderRadius: 20,
                                                            backgroundColor: isSelected ? '#f0edff' : 'white',
                                                            borderWidth: isSelected ? 2 : 1,
                                                            borderColor: isSelected ? '#6b5aed' : '#d1d5db',
                                                        }}
                                                    >
                                                        <View style={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: 12,
                                                            borderWidth: 2,
                                                            borderColor: isSelected ? '#6b5aed' : '#d1d5db',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginRight: 14,
                                                        }}>
                                                            {isSelected && (
                                                                <View style={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    borderRadius: 6,
                                                                    backgroundColor: '#6b5aed',
                                                                }} />
                                                            )}
                                                        </View>

                                                        <View style={{ flex: 1 }}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                                <Text className="text-black font-semibold text-base">
                                                                    {formatMonthYear(budget.dateStart)}
                                                                </Text>
                                                                {isCurrent && (
                                                                    <View style={{
                                                                        backgroundColor: '#dcfce7',
                                                                        paddingHorizontal: 8,
                                                                        paddingVertical: 2,
                                                                        borderRadius: 8,
                                                                    }}>
                                                                        <Text className="text-[#16a34a] text-xs font-semibold">Current</Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                            <Text className="text-gray-500 text-xs mt-1">
                                                                {(budget.spent ?? 0).toFixed(0)} zł of {(budget.budgetLimit ?? 0).toFixed(0)} zł
                                                            </Text>
                                                        </View>

                                                        <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text className={`text-xs font-bold ${isOver ? 'text-red-400' : 'text-[#6b5aed]'}`}>
                                                                {percentage.toFixed(0)}%
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })
                                        )}
                                    </ScrollView>

                                    <View style={{ gap: 12, marginTop: 20 }}>
                                        <TouchableOpacity
                                            onPress={handleGenerate}
                                            disabled={!selectedBudgetId}
                                            style={{
                                                backgroundColor: selectedBudgetId ? '#6b5aed' : '#d1d5db',
                                                borderRadius: 9999,
                                                paddingVertical: 14,
                                            }}
                                        >
                                            <Text className={`font-bold text-lg text-center ${selectedBudgetId ? 'text-white' : 'text-gray-500'}`}>
                                                Generate
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handleClose}
                                            className="bg-[#ebe9fc] rounded-full py-[14px]"
                                        >
                                            <Text className="font-bold text-lg text-accent text-center">Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

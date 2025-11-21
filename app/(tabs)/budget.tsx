import React, {useState} from "react";
import {
    ScrollView,
    TouchableOpacity,
    View,
    Alert, StyleSheet
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiProgressBar } from "moti";
import BudgetCategoryModal from "@/components/budget/BudgetCategoryModal";
import {LinearGradient} from "expo-linear-gradient";
import {BudgetCategory} from "@/types";
import {useRouter} from "expo-router";
import {Text} from '@/components/ui/Text'
import {useUserStore} from "@/store/userStore";
import BudgetCreateModal from "@/components/budget/BudgetCreateModal";

export default function Budget() {
    const currentBudget = useUserStore(state => state.user?.currentBudget ?? null);
    const budgetCategories = (currentBudget?.budgetCategories || []).filter(cat => cat !== null && cat !== undefined);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
    const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
    const totalRemaining = totalAllocated - totalSpent;
    const percentageSpent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    const [budgetCreateModalVisible, setBudgetCreateModalVisible] = useState(false);
    const router = useRouter();
    const handleCategoryPress = (category: BudgetCategory) => {
        router.push({
            pathname: '/(budget)/BudgetDetails',
            params: {
                id: category.id,
                name: category.name,
                iconUri: category.iconUri,
                color: category.color,
                allocated: category.allocated,
                spent: category.spent,
            }
        });
    };

    const handleDeleteCategory = (categoryId: number) => {
        Alert.alert(
            "Delete Category",
            "Are you sure you want to delete this budget category?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        const updatedCategories = budgetCategories.filter(cat => cat.id !== categoryId);
                        useUserStore.getState().updateBudgetCategories(updatedCategories);
                    }
                }
            ]
        );
    };
    const closeModal = () => {
        setIsAddModalVisible(false);
    };

    return (
        <SafeAreaView edges={[]} className="bg-white flex-1">
            <LinearGradient
                colors={['#f2f0ff', '#ffffff']}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 0.6}}
                style={styles.gradient}
            >
                {!currentBudget ? (
                        <View className="flex-1 flex-col items-center justify-center">
                            <TouchableOpacity className={'bg-accent px-4 py-4 rounded-full mb-4'} onPress={()=> setBudgetCreateModalVisible(true)}>
                                <Text className={'font-semibold text-white text-xl'}>Create new budget</Text>
                            </TouchableOpacity>
                        </View>
                    ) :
                        (
            <ScrollView
                className="flex-1 "
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 100,
                    gap: 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        shadowColor: '#6b5aed',
                        shadowOpacity: 0.2,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 6 },
                        elevation: 8,
                    }}
                    className="bg-[#6b5aed] rounded-3xl p-5 gap-2"
                >
                    <View className="flex flex-row justify-between items-center">
                        <Text className="text-white text-lg font-bold">Monthly Budget</Text>
                        <IconSymbol name="ellipsis" color="white" weight="bold" size={24} />
                    </View>

                    <View>
                        <View className="flex-row justify-between items-baseline">
                            <View>
                                <Text className="text-white/70 text-sm">Total Budget</Text>
                                <Text className="text-white text-xl font-bold">
                                    {currentBudget?.budgetLimit?.toFixed(2) ?? '0.00'} zł
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-white/70 text-sm">Remaining</Text>
                                <Text className="text-[#ffcc4d] text-xl font-bold">
                                    {totalRemaining.toFixed(2)} zł
                                </Text>
                            </View>
                        </View>

                        <View className="mt-3">
                            <MotiProgressBar
                                progress={percentageSpent / 100}
                                color="#ffcc4d"
                                height={10}
                                containerColor="white"
                            />

                            <Text className="text-xs text-white/70 font-semibold mt-1">
                                {percentageSpent.toFixed(0)}% of your budget spent
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row justify-between items-center">
                    <Text className="text-black text-xl font-bold">Budget Categories</Text>
                    <Text className="text-[#6b5aed]">{budgetCategories.length} categories</Text>
                </View>

                {budgetCategories.length === 0 && (
                    <View className=" rounded-[24px] p-6 items-center justify-center" style={{ height: 200 }}>
                        <TouchableOpacity
                            className="bg-[#6b5aed] px-6 py-3 rounded-full mt-4"
                            onPress={() => setIsAddModalVisible(true)}
                        >
                            <Text className="text-white font-bold text-center text-xl">Add Category</Text>
                        </TouchableOpacity>
                        <Text className="text-gray-500 text-sm text-center mt-1 px-10">
                            Tap the + button to create your first budget category
                        </Text>
                    </View>
                )}

                <View className="flex flex-row flex-wrap justify-between gap-2">
                    {budgetCategories.map((category) => {
                        const percentageSpent = category.allocated > 0
                            ? Math.min(100, (category.spent / category.allocated) * 100)
                            : 0;

                        return (
                            <TouchableOpacity
                                key={category.id}
                                activeOpacity={0.7}
                                className="relative flex flex-col justify-between rounded-[24px] p-4 overflow-hidden shadow-sm mb-2"
                                style={{
                                    backgroundColor: category.color,
                                    width: '48%',
                                    height: 140
                                }}
                                onLongPress={() => handleDeleteCategory(category.id)}
                                onPress={() => handleCategoryPress(category)}
                            >
                                <View>
                                    <Text className="text-white font-bold text-xl">
                                        {category.name}
                                    </Text>
                                    <Text className="text-white/70 text-sm mt-1">
                                        {percentageSpent.toFixed(0)}% used
                                    </Text>
                                </View>

                                <View className="flex flex-row items-end justify-end">
                                    <View className=" mr-2">
                                        <Text className="text-white font-semibold text-sm">
                                            {category.spent.toFixed(0)} zł
                                        </Text>
                                        <Text className="text-white/70 text-xs">
                                            of {category.allocated.toFixed(0)} zł
                                        </Text>
                                    </View>
                                    <View className="w-2 h-16 bg-white rounded-full overflow-hidden border border-white">
                                        <View
                                            className="w-full bg-red-500/70 rounded-full"
                                            style={{
                                                height: `${percentageSpent}%`,
                                                alignSelf: 'flex-end',
                                                position: 'absolute',
                                                bottom: 0,
                                            }}
                                        />
                                    </View>
                                </View>

                                <View className="absolute left-[-16px] bottom-[-8px]">
                                    <IconSymbol
                                        name={category.iconUri}
                                        size={64}
                                        color="white"
                                        style={{ opacity: 0.4 }}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
                    )}
            </LinearGradient>

            {currentBudget &&
            <TouchableOpacity
                className="absolute bottom-28 right-4 bg-[#6b5aed] p-6 rounded-full z-10 shadow-md"
                activeOpacity={0.8}
                onPress={() => {
                    setIsAddModalVisible(true);
                }}
            >
                <IconSymbol name="plus" color="white" weight="bold" size={26} />
            </TouchableOpacity>}
            <BudgetCreateModal visible={budgetCreateModalVisible} onClose={()=>setBudgetCreateModalVisible(false)} />
            <BudgetCategoryModal
                visible={isAddModalVisible}
                onClose={closeModal}
            />
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    modalContainer: {
        height: '95%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
    }
});
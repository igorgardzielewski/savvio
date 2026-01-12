import BudgetCategoryModal from "@/components/budget/BudgetCategoryModal";
import BudgetCreateModal from "@/components/budget/BudgetCreateModal";
import DeleteModal from "@/components/DeleteModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from '@/components/ui/Text';
import { getColorBySpent } from "@/helpers/budgetHelpers";
import { formatDateShort } from "@/helpers/timeHelper";
import { useAuthStore } from "@/store/authStore";
import { Budget as BudgetType, useUserStore } from "@/store/userStore";
import { BudgetCategory, Transaction } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiProgressBar, MotiView } from "moti";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SFSymbols6_0 } from "sf-symbols-typescript";

export default function BudgetScreen() {
    const { setCurrentBudget } = useUserStore();
    const currentBudget = useUserStore(state => state.user?.currentBudget ?? null);
    const previousBudgets = useUserStore(state => state.user?.previousBudgets ?? null);
    const transactionsList = useUserStore(state => state.user?.allTransactions);
    const setAllTransactions = useUserStore(state => state.setAllTransactions);
    const { token } = useAuthStore();
    const [budgetsExpanded, setBudgetsExpanded] = useState<boolean>(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [budgetCreateModalVisible, setBudgetCreateModalVisible] = useState(false);
    const [selectedBudgetId, setSelectedBudgetId] = useState<number | undefined>(undefined);
    const [historyBudgetVisible, setHistoryBudgetVisible] = useState(false);
    const [historyBudgetData, setHistoryBudgetData] = useState<BudgetType | null>(null);
    const [prevHistoryLoader, setPrevHistoryLoader] = useState<number>(0)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [longPressedBudgetCategory, setLongPressedCategory] = useState<BudgetCategory | undefined>(undefined);
    const budgetToShow = historyBudgetVisible && historyBudgetData ? historyBudgetData : currentBudget;
    const router = useRouter();
    const [editMode, setEditMode] = useState(false);
    const budgetCategories = (budgetToShow?.budgetCategories || []).filter(cat => cat !== null && cat !== undefined);
    const totalAllocatedToShow = budgetToShow?.budgetLimit || 0;
    const totalSpentToShow = budgetToShow?.spent || 0;
    const totalRemainingToShow = totalAllocatedToShow - totalSpentToShow;
    const percentageSpentToShow = totalAllocatedToShow > 0 ? (totalSpentToShow / totalAllocatedToShow) * 100 : 0;
    const refLeftColumn = useRef<View>(null);
    const refRightColumn = useRef<View>(null);
    const totalAllocated = currentBudget?.budgetLimit || 0;
    const totalSpent = currentBudget?.spent || 0;
    const percentageSpent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    useEffect(() => {
        if (currentBudget) setSelectedBudgetId(currentBudget.id);
    }, [currentBudget]);


    const uncategorizedTransactions = useMemo(() => {
        if (!transactionsList || !budgetToShow) return [];

        const allTransactions: Transaction[] = [];
        Object.values(transactionsList).forEach(transactions => {
            transactions.forEach(t => {
                if (t.budget?.id === budgetToShow.id && !t.budgetCategory) {
                    allTransactions.push(t);
                }
            });
        });
        return allTransactions;
    }, [transactionsList, budgetToShow]);

    const uncategorizedTotal = uncategorizedTransactions.reduce((sum, t) => sum + t.amount, 0);

    const [categoryHeights, setCategoryHeights] = useState<{ [key: number]: number }>({});

    const { leftHeight, rightHeight } = useMemo(() => {
        let left = 0;
        let right = 0;

        budgetCategories.forEach((category, index) => {
            const height = categoryHeights[category.id] || 158;
            if (index % 2 === 0) {
                left += height;
            } else {
                right += height;
            }
        });

        return { leftHeight: left, rightHeight: right };
    }, [budgetCategories, categoryHeights]);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (transactionsList || !token || !currentBudget) return;

            try {
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/transactions/all`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAllTransactions(data);
                }
            } catch (e) {
                console.log('Failed to fetch transactions:', e);
            }
        };

        fetchTransactions();
    }, [token, currentBudget, transactionsList, setAllTransactions]);

    const handleCategoryPress = (category: BudgetCategory) => {
        const categoryTransactions: { [date: string]: Transaction[] } = {};

        if (transactionsList && budgetToShow) {
            Object.entries(transactionsList).forEach(([date, transactions]) => {
                const filtered = transactions.filter(t =>
                    t.budget?.id === budgetToShow.id &&
                    t.budgetCategory?.id === category.id
                );
                if (filtered.length > 0) {
                    categoryTransactions[date] = filtered;
                }
            });
        }

        router.push({
            pathname: '/(budget)/BudgetDetails',
            params: {
                id: category.id,
                name: category.name,
                iconUri: category.iconUri,
                color: category.color,
                allocated: category.allocated,
                spent: category.spent,
                transactions: JSON.stringify(categoryTransactions),
            }
        });
    };
    const getHistoryBudget = async (budgetId: number | undefined) => {
        if (!budgetId) return;
        if (historyBudgetData?.id === budgetId) {
            setHistoryBudgetVisible(true);
            setSelectedBudgetId(budgetId);
            setBudgetsExpanded(false);
            return;
        }

        try {
            setPrevHistoryLoader(budgetId);
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/budgetUser/${budgetId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!res.ok) {
                console.log('Failed to fetch budget history');
                return;
            }
            const data = await res.json();
            console.log(data);
            setHistoryBudgetData(data);
            setSelectedBudgetId(budgetId);
            setHistoryBudgetVisible(true);
            setBudgetsExpanded(false);
        }
        catch (e) {
            console.log('Failed to fetch budget history', e);
        }
        finally {
            setPrevHistoryLoader(0);
        }
    }

    const changeToCurrentBudget = () => {
        if (!currentBudget) return;
        setHistoryBudgetVisible(false);
        setSelectedBudgetId(currentBudget.id);
        setBudgetsExpanded(false);
    }

    const handleDeleteCategory = async () => {
        if (!longPressedBudgetCategory) return;
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/budgetUser/budgetCategory/${longPressedBudgetCategory?.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                setCurrentBudget(data);
                setAllTransactions(data.transactions);
                return true;
            };
            return false;
        }
        catch (e) {
            console.log('Failed to delete budget category', e);
        }
    };
    const closeModal = () => {
        setIsAddModalVisible(false);
    };
    const handleCreateNewBudget = () => {
        setBudgetCreateModalVisible(true);
    }
    return (
        <SafeAreaView edges={[]} className="bg-white flex-1">
            <LinearGradient
                colors={['#f2f0ff', '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.6 }}
                style={styles.gradient}
            >
                {!budgetToShow ? (
                    <View className="flex-1 flex-col items-center justify-center">
                        <TouchableOpacity className={'bg-accent px-4 py-4 rounded-full mb-4'} onPress={() => setBudgetCreateModalVisible(true)}>
                            <Text className={'font-semibold text-white text-xl'}>Create new budget</Text>
                        </TouchableOpacity>
                    </View>
                ) :
                    (
                        <>

                            <View style={{ zIndex: 100 }}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    style={{
                                        shadowColor: '#6b5aed',
                                        shadowOpacity: 0.3,
                                        shadowRadius: 16,
                                        marginHorizontal: 16,
                                        marginTop: 12,
                                        shadowOffset: { width: 0, height: 6 },
                                        elevation: 10,
                                        zIndex: 10,
                                        backgroundColor: '#6b5aed',
                                        padding: 20,
                                        gap: 8,
                                        borderRadius: 20,
                                        // borderTopLeftRadius: 20,
                                        // borderTopRightRadius: 20,
                                        // borderBottomLeftRadius: budgetsExpanded ? 0 : 20,
                                        // borderBottomRightRadius: budgetsExpanded ? 0 : 20,
                                    }}
                                    onPress={() => setBudgetsExpanded(!budgetsExpanded)}
                                >
                                    <View className="flex flex-row justify-between items-center">
                                        <Text className="text-white text-lg font-bold">
                                            {formatDateShort(budgetToShow.dateStart)}&nbsp;-&nbsp;{formatDateShort(budgetToShow.dateEnd)}
                                        </Text>
                                        <IconSymbol
                                            name={budgetsExpanded ? "chevron.up" : "chevron.down"}
                                            size={16}
                                            color="white"
                                        />
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
                                                <Text
                                                    className="text-xl font-bold"
                                                    style={{ color: getColorBySpent(budgetToShow.spent || 0, budgetToShow.budgetLimit || 0) }}
                                                >
                                                    {totalRemainingToShow.toFixed(2)} zł
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="mt-3">
                                            <MotiProgressBar
                                                progress={Math.min(percentageSpentToShow / 100, 1)}
                                                color={getColorBySpent(budgetToShow.spent || 0, budgetToShow.budgetLimit || 0)}
                                                height={10}
                                                containerColor="white"
                                            />

                                            <Text
                                                className="text-xs font-semibold mt-1"
                                                style={{ color: getColorBySpent(budgetToShow.spent || 0, budgetToShow.budgetLimit || 0) }}
                                            >
                                                {percentageSpentToShow.toFixed(0)}% of your budget spent
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {budgetsExpanded && (
                                    <MotiView
                                        from={{ opacity: 0, translateY: -20 }}
                                        animate={{ opacity: 1, translateY: 0 }}
                                        exit={{ opacity: 0, translateY: -20 }}
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 16,
                                            right: 16,
                                            backgroundColor: 'white',
                                            paddingBottom: previousBudgets ? 8 : 0,
                                            borderRadius: 20,
                                            marginTop: 8,
                                            shadowColor: "#6b5aed",
                                            shadowOffset: { width: 0, height: 10 },
                                            shadowOpacity: 0.4,
                                            shadowRadius: 20,
                                            elevation: 20,
                                            zIndex: 5,
                                        }}
                                    >
                                        {!historyBudgetVisible && <View className={'p-2 flex flex-row items-center justify-center gap-2  rounded-t-[20px]'}>
                                            <TouchableOpacity className={'flex items-center flex-row justify-center gap-2 flex-1 p-3 bg-white rounded-[20px] border border-accent'} onPress={() => { setEditMode(true); setBudgetCreateModalVisible(true); }}>
                                                <IconSymbol name={'square.and.pencil'} color="#6B5AED" size={32} weight={'semibold'} />
                                                <Text className={'text-accent text-xl font-semibold'}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleCreateNewBudget()}
                                                className={'flex items-center flex-row gap-2 justify-center flex-1 p-3 bg-white rounded-[20px] border border-accent'}>
                                                <IconSymbol name="plus" size={32} color="#6B5AED" weight={'semibold'} />
                                                <Text className={'text-accent text-xl font-semibold'}>Create</Text>
                                            </TouchableOpacity>
                                        </View>}
                                        {previousBudgets && (
                                            <View className={`bg-white ${historyBudgetVisible ? 'rounded-[20px]' : 'rounded-b-[20px]'} max-h-[240px]`}>
                                                <ScrollView style={{ maxHeight: 240 }} contentContainerStyle={{ gap: 8, padding: 8, borderRadius: 20 }}>
                                                    <TouchableOpacity className={`p-4 ${!historyBudgetVisible ? 'bg-accent/50' : 'bg-accent'} rounded-[20px] flex flex-row w-full justify-between items-center`} disabled={prevHistoryLoader !== 0 || selectedBudgetId === currentBudget?.id}
                                                        onPress={() => changeToCurrentBudget()}
                                                    >
                                                        {prevHistoryLoader === currentBudget?.id ? <ActivityIndicator size="small" color="white" /> : <>
                                                            <View className={`flex flex-col gap-2`}>
                                                                <Text className="text-white text-xl font-semibold">{formatDateShort(currentBudget?.dateStart.toString() || '')}&nbsp;-&nbsp;{formatDateShort(currentBudget?.dateEnd.toString() || '')}</Text>
                                                                <View className={'flex flex-row items-center gap-2 w-1/2'}>
                                                                    <MotiProgressBar
                                                                        progress={Math.min(percentageSpent / 100, 1)}
                                                                        color={getColorBySpent(currentBudget?.spent || 0, currentBudget?.budgetLimit || 0)}
                                                                        height={10}
                                                                        containerColor="white"
                                                                        style={{ flex: 1 }}
                                                                    />
                                                                    <Text className={'text-white text-[8px] font-semibold'}>{percentageSpent.toFixed(2)}% spent</Text>
                                                                </View>
                                                            </View>
                                                            <TouchableOpacity>
                                                                <IconSymbol name="chevron.right" size={24} color="white" />
                                                            </TouchableOpacity>
                                                        </>
                                                        }
                                                    </TouchableOpacity>
                                                    {previousBudgets.map((item) => {
                                                        const percentageSpent = (item.spent || 0) / (item.budgetLimit || 1) * 100;
                                                        return (
                                                            <TouchableOpacity key={item.id} className={`${prevHistoryLoader === item.id || selectedBudgetId === item.id ? 'bg-accent/50' : 'bg-accent'} p-4 rounded-[20px] flex flex-row w-full ${prevHistoryLoader === item.id ? 'justify-center' : 'justify-between'} items-center`} disabled={prevHistoryLoader !== 0 || selectedBudgetId === item.id} onPress={() => getHistoryBudget(item.id)}>
                                                                {prevHistoryLoader === item.id ? <ActivityIndicator size="large" color="white" /> : <>
                                                                    <View className={`flex flex-col gap-2`}>
                                                                        <Text className="text-white text-xl font-semibold">{formatDateShort(item.dateStart.toString())}&nbsp;-&nbsp;{formatDateShort(item.dateEnd.toString())}</Text>
                                                                        <View className={'flex flex-row items-center gap-2 w-1/2'}>
                                                                            <MotiProgressBar
                                                                                progress={Math.min(percentageSpent / 100, 1)}
                                                                                color={getColorBySpent(item.spent || 0, item.budgetLimit || 0)}
                                                                                height={10}
                                                                                containerColor="white"
                                                                                style={{ flex: 1 }}
                                                                            />
                                                                            <Text className={'text-white text-[8px] font-semibold'}>{percentageSpent.toFixed(2)}% spent</Text>
                                                                        </View>
                                                                    </View>
                                                                    <TouchableOpacity>
                                                                        <IconSymbol name="chevron.right" size={24} color="white" />
                                                                    </TouchableOpacity>
                                                                </>
                                                                }
                                                            </TouchableOpacity>
                                                        )
                                                    })}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </MotiView>
                                )}
                            </View>
                            <ScrollView
                                className="flex-1"
                                contentContainerStyle={{
                                    paddingHorizontal: 16,
                                    paddingTop: 12,
                                    paddingBottom: 100,
                                    gap: 16,
                                }}
                                showsVerticalScrollIndicator={false}
                            >

                                <View className="flex-row justify-between items-center">
                                    <Text className="text-black text-xl font-bold">Budget Categories</Text>
                                    <Text className="text-[#6b5aed]">{budgetCategories.length} categories</Text>
                                </View>

                                {budgetCategories.length === 0 && uncategorizedTransactions.length === 0 && (
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

                                <View className="flex flex-row justify-between w-full gap-2" style={{ alignItems: 'flex-start' }}>
                                    <View
                                        className="flex-1 flex-col gap-2"
                                        ref={refLeftColumn}
                                    >
                                        {budgetCategories.map((category, _) => {
                                            if (_ % 2 !== 0) return null;
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
                                                        minHeight: 140
                                                    }}
                                                    onLayout={(event) => {
                                                        const { height } = event.nativeEvent.layout;
                                                        setCategoryHeights(prev => ({ ...prev, [category.id]: height }));
                                                    }}
                                                    onLongPress={() => { if (!historyBudgetVisible) { setLongPressedCategory(category); setDeleteModalVisible(true) } }}
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
                                                            name={category.iconUri as SFSymbols6_0}
                                                            size={64}
                                                            color="white"
                                                            style={{ opacity: 0.4 }}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                        {leftHeight <= rightHeight && uncategorizedTransactions.length > 0 && (
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                className="relative flex flex-col justify-between rounded-[24px] p-4 overflow-hidden shadow-sm mb-2"
                                                style={{
                                                    backgroundColor: '#9ca3af',
                                                    minHeight: 140,
                                                }}
                                                onPress={() => {
                                                    const othersTransactions: { [date: string]: Transaction[] } = {};

                                                    if (transactionsList && budgetToShow) {
                                                        Object.entries(transactionsList).forEach(([date, transactions]) => {
                                                            const filtered = transactions.filter(t =>
                                                                t.budget?.id === budgetToShow.id &&
                                                                !t.budgetCategory
                                                            );
                                                            if (filtered.length > 0) {
                                                                othersTransactions[date] = filtered;
                                                            }
                                                        });
                                                    }

                                                    router.push({
                                                        pathname: '/(budget)/BudgetDetails',
                                                        params: {
                                                            id: 0,
                                                            name: 'Others',
                                                            iconUri: 'questionmark.circle.fill',
                                                            color: '#9ca3af',
                                                            allocated: 0,
                                                            spent: uncategorizedTotal,
                                                            transactions: JSON.stringify(othersTransactions),
                                                            isOthers: 'true',
                                                        }
                                                    });
                                                }}
                                            >
                                                <View>
                                                    <Text className="text-white font-bold text-xl">
                                                        Others
                                                    </Text>
                                                    <Text className="text-white/70 text-sm mt-1">
                                                        {uncategorizedTransactions.length} transactions
                                                    </Text>
                                                </View>

                                                <View className="flex flex-row items-end justify-end">
                                                    <View className="mr-2">
                                                        <Text className="text-white font-semibold text-sm">
                                                            {uncategorizedTotal.toFixed(0)} zł
                                                        </Text>
                                                        <Text className="text-white/70 text-xs">
                                                            uncategorized
                                                        </Text>
                                                    </View>
                                                    <View className="w-2 h-16 bg-white/20 rounded-full overflow-hidden border border-white">
                                                        <View
                                                            className="w-full bg-white/70 rounded-full"
                                                            style={{
                                                                height: '100%',
                                                                alignSelf: 'flex-end',
                                                                position: 'absolute',
                                                                bottom: 0,
                                                            }}
                                                        />
                                                    </View>
                                                </View>

                                                <View className="absolute left-[-16px] bottom-[-8px]" style={{ width: 64, height: 64 }}>
                                                    <IconSymbol
                                                        name="questionmark.circle.fill"
                                                        size={64}
                                                        color="white"
                                                        style={{ opacity: 0.4, position: 'absolute' }}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View
                                        className="flex-1 flex-col gap-2"
                                        ref={refRightColumn}
                                    >
                                        {budgetCategories.map((category, _) => {
                                            if (_ % 2 === 0) return null;
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
                                                        minHeight: 140
                                                    }}
                                                    onLayout={(event) => {
                                                        const { height } = event.nativeEvent.layout;
                                                        setCategoryHeights(prev => ({ ...prev, [category.id]: height }));
                                                    }}
                                                    onLongPress={() => { if (!historyBudgetVisible) { setLongPressedCategory(category); setDeleteModalVisible(true) } }}
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
                                                            name={category.iconUri as SFSymbols6_0}
                                                            size={64}
                                                            color="white"
                                                            style={{ opacity: 0.4 }}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                        {leftHeight > rightHeight && uncategorizedTransactions.length > 0 && (
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                className="relative flex flex-col justify-between rounded-[24px] p-4 overflow-hidden shadow-sm mb-2"
                                                style={{
                                                    backgroundColor: '#9ca3af',
                                                    minHeight: 140,
                                                }}
                                                onPress={() => {
                                                    const othersTransactions: { [date: string]: Transaction[] } = {};

                                                    if (transactionsList && budgetToShow) {
                                                        Object.entries(transactionsList).forEach(([date, transactions]) => {
                                                            const filtered = transactions.filter(t =>
                                                                t.budget?.id === budgetToShow.id &&
                                                                !t.budgetCategory
                                                            );
                                                            if (filtered.length > 0) {
                                                                othersTransactions[date] = filtered;
                                                            }
                                                        });
                                                    }

                                                    router.push({
                                                        pathname: '/(budget)/BudgetDetails',
                                                        params: {
                                                            id: 0,
                                                            name: 'Others',
                                                            iconUri: 'questionmark.circle.fill',
                                                            color: '#9ca3af',
                                                            allocated: 0,
                                                            spent: uncategorizedTotal,
                                                            transactions: JSON.stringify(othersTransactions),
                                                            isOthers: 'true',
                                                        }
                                                    });
                                                }}
                                            >
                                                <View>
                                                    <Text className="text-white font-bold text-xl">
                                                        Others
                                                    </Text>
                                                    <Text className="text-white/70 text-sm mt-1">
                                                        {uncategorizedTransactions.length} transactions
                                                    </Text>
                                                </View>

                                                <View className="flex flex-row items-end justify-end">
                                                    <View className="mr-2">
                                                        <Text className="text-white font-semibold text-sm">
                                                            {uncategorizedTotal.toFixed(0)} zł
                                                        </Text>
                                                        <Text className="text-white/70 text-xs">
                                                            uncategorized
                                                        </Text>
                                                    </View>
                                                    <View className="w-2 h-16 bg-white/20 rounded-full overflow-hidden border border-white">
                                                        <View
                                                            className="w-full bg-white/70 rounded-full"
                                                            style={{
                                                                height: '100%',
                                                                alignSelf: 'flex-end',
                                                                position: 'absolute',
                                                                bottom: 0,
                                                            }}
                                                        />
                                                    </View>
                                                </View>

                                                <View className="absolute left-[-16px] bottom-[-8px]" style={{ width: 64, height: 64 }}>
                                                    <IconSymbol
                                                        name="questionmark.circle.fill"
                                                        size={64}
                                                        color="white"
                                                        style={{ opacity: 0.4, position: 'absolute' }}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </ScrollView>
                        </>
                    )}
            </LinearGradient>

            {currentBudget && !historyBudgetVisible &&
                <TouchableOpacity
                    className="absolute bottom-28 right-4 bg-[#6b5aed] p-6 rounded-full z-10 shadow-md"
                    activeOpacity={0.8}
                    onPress={() => {
                        setIsAddModalVisible(true);
                    }}
                >
                    <IconSymbol name="plus" color="white" weight="bold" size={26} />
                </TouchableOpacity>
            }
            {historyBudgetVisible &&
                <TouchableOpacity
                    className="absolute bottom-28 right-4 bg-[#6b5aed] p-6 rounded-full z-10 shadow-md"
                    activeOpacity={0.8}
                    onPress={() => changeToCurrentBudget()}
                >
                    <IconSymbol name="arrow.uturn.left" color="white" weight="bold" size={26} />
                </TouchableOpacity>
            }
            <BudgetCreateModal visible={budgetCreateModalVisible} onClose={() => { setBudgetCreateModalVisible(false); editMode && setEditMode(false) }} editMode={editMode} />
            <BudgetCategoryModal
                visible={isAddModalVisible}
                onClose={closeModal}
            />
            <DeleteModal visible={deleteModalVisible} onClose={() => { setDeleteModalVisible(false); setLongPressedCategory(undefined) }} onDelete={handleDeleteCategory} budgetCategory={longPressedBudgetCategory} />
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
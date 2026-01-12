import TransactionDetailModal from "@/components/TransactionDetailModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from '@/components/ui/Text';
import { getLogoSource } from "@/helpers/imageHelpers";
import { getShopIcon } from "@/helpers/shopCategoryHelpers";
import { formatDateLong, formatTime } from "@/helpers/timeHelper";
import { getUserCategories } from "@/helpers/transactionHelpers";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { Transaction, TransactionCategoriesGroups, transactionList } from "@/types";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Image,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { SFSymbols6_0 } from "sf-symbols-typescript";

const { width: screenWidth } = Dimensions.get('window');
const PADDING_HORIZONTAL = 8;
const GAP = 8;
const CARD_WIDTH_SMALL = screenWidth * 0.35;
const CARD_WIDTH_LARGE = screenWidth * 0.96;
export default function TabTwoScreen() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<TransactionCategoriesGroups | null>(null);
    const transactionsList = useUserStore(state => state.user?.allTransactions ?? null);
    const setAllTransactions = useUserStore(state => state.setAllTransactions);
    const { token } = useAuthStore()
    const [errorFetch, setErrorFetch] = useState('');
    const [fetching, setFetching] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const params = useLocalSearchParams()
    const idFromParams = params.id ? (typeof params.id === 'string' ? parseInt(params.id, 10) : params.id) : null;

    const widthAnims = useRef<Animated.Value[]>([]);
    const opacityAnims = useRef<Animated.Value[]>([]);
    const [periodSpendingsCateogry, setPeriodSpendingsCategory] = useState<number | null>(null)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const currentBudget = useUserStore(state => state.user?.currentBudget ?? null);

    const handleCloseModal = useCallback(() => {
        setDetailModalVisible(false);
        setSelectedTransaction(null);
    }, []);

    const userCategories = useMemo(() => {
        if (!transactionsList) return [];
        return getUserCategories(transactionsList);
    }, [transactionsList]);

    const findTransactionById = useCallback((id: number): Transaction | null => {
        if (!transactionsList) return null;

        for (const transactions of Object.values(transactionsList)) {
            const found = transactions.find(t => t.id === id);
            if (found) return found;
        }
        return null;
    }, [transactionsList]);
    useEffect(() => {
        if (widthAnims.current.length !== userCategories.length) {
            widthAnims.current = userCategories.map(() => new Animated.Value(CARD_WIDTH_SMALL));
            opacityAnims.current = userCategories.map(() => new Animated.Value(1));
        }
    }, [userCategories]);

    useEffect(() => {
        if (!userCategories.length || !widthAnims.current.length) return;

        const activeIndex = userCategories.findIndex(category => category.categoryName === activeCategory?.categoryName);

        userCategories.forEach((category, index) => {
            const isActive = activeCategory?.categoryName === category.categoryName;

            widthAnims.current[index].stopAnimation();
            opacityAnims.current[index].stopAnimation();

            Animated.parallel([
                Animated.timing(widthAnims.current[index], {
                    toValue: isActive ? CARD_WIDTH_LARGE : CARD_WIDTH_SMALL,
                    duration: 350,
                    useNativeDriver: false,
                    easing: Easing.out(Easing.cubic),
                }),
                Animated.timing(opacityAnims.current[index], {
                    toValue: activeCategory && !isActive ? 0 : 1,
                    duration: 250,
                    useNativeDriver: false,
                    easing: Easing.inOut(Easing.ease),
                })
            ]).start();
        });

        if (activeCategory && activeIndex !== -1) {
            let scrollX = 0;
            for (let i = 0; i < activeIndex; i++) {
                scrollX += CARD_WIDTH_SMALL + GAP;
            }
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: Math.max(0, scrollX), animated: true });
            }, 100);
        }
    }, [activeCategory, userCategories]);


    useEffect(() => {
        const handleFetchTransactions = async () => {
            setFetching(true)
            try {
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/transactions/all`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (!res.ok) {
                    console.log(res)
                }
                const data = await res.json()
                setAllTransactions(data)
            }
            catch (e) {
                setErrorFetch('Failed to fetch transactions. Please try again later.')
                console.log(e)
            }
            finally {
                setFetching(false)
            }
        }
        handleFetchTransactions()
    }, [token, setAllTransactions]);

    useEffect(() => {
        if (idFromParams && transactionsList) {
            const id = typeof idFromParams === 'number' ? idFromParams : parseInt(idFromParams[0], 10);
            const foundTransaction = findTransactionById(id);
            if (foundTransaction) {
                setSelectedTransaction(foundTransaction)
                setDetailModalVisible(true)
                router.setParams({ id: undefined });
            }
        }
    }, [idFromParams, transactionsList, router, findTransactionById]);
    useFocusEffect(
        useCallback(() => {
            const reopenTransactionId = (global as any).__reopenTransactionId;
            if (reopenTransactionId && transactionsList) {
                const foundTransaction = findTransactionById(reopenTransactionId);
                if (foundTransaction) {
                    setSelectedTransaction(foundTransaction);
                    setDetailModalVisible(true);
                    delete (global as any).__reopenTransactionId;
                }
            }
        }, [transactionsList, findTransactionById])
    );

    useEffect(() => {
        if (selectedTransaction && transactionsList) {
            const updatedTransaction = findTransactionById(selectedTransaction.id);
            if (updatedTransaction && JSON.stringify(updatedTransaction) !== JSON.stringify(selectedTransaction)) {
                setSelectedTransaction(updatedTransaction);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionsList, selectedTransaction?.id, findTransactionById]);

    const calculateEndPadding = useCallback(() => {
        const basePadding = (screenWidth - CARD_WIDTH_SMALL) / 2;

        if (!activeCategory) return basePadding;

        const activeIndex = userCategories.findIndex(cat => cat.categoryName === activeCategory.categoryName);
        if (activeIndex === -1) return basePadding;

        const cardsAfter = userCategories.length - activeIndex - 1;
        const spaceNeeded = cardsAfter * (CARD_WIDTH_SMALL + GAP);
        const centerOffset = (screenWidth - CARD_WIDTH_LARGE - PADDING_HORIZONTAL * 2) / 2;

        return Math.max(basePadding, centerOffset - spaceNeeded + GAP);
    }, [activeCategory, userCategories]);

    const filteredTransactions = useMemo(() => {
        if (!transactionsList) return { filtered: {}, totalSpent: 0, sortedEntries: [] };

        const filtered: transactionList = {};
        let totalySpentOnFilteredThisPeriod = 0;

        const searchLower = searchQuery.toLowerCase();

        Object.entries(transactionsList).forEach(([date, transactions]) => {
            const filteredTransactions = transactions.filter(transaction => {
                const matchesCategory = !activeCategory ||
                    transaction.shop.categoryName === activeCategory.categoryName;

                const matchesSearch = !searchQuery ||
                    transaction.shop.name.toLowerCase().includes(searchLower) ||
                    transaction.shop.categoryName.toLowerCase().includes(searchLower);

                return matchesCategory && matchesSearch;
            });

            if (filteredTransactions.length > 0) {
                filteredTransactions.forEach(transaction => {
                    if (transaction.budget?.id === currentBudget?.id) {
                        totalySpentOnFilteredThisPeriod += transaction.amount;
                    }
                });
                filtered[date] = filteredTransactions;
            }
        });

        // Sortowanie raz w useMemo zamiast przy renderze
        const sortedEntries = Object.entries(filtered).sort(([dateA], [dateB]) => dateB.localeCompare(dateA));

        return { filtered, totalSpent: totalySpentOnFilteredThisPeriod, sortedEntries };
    }, [transactionsList, activeCategory, searchQuery, currentBudget?.id]);

    useEffect(() => {
        if (activeCategory || searchQuery.length > 0) {
            setPeriodSpendingsCategory(
                filteredTransactions.totalSpent > 0 ? filteredTransactions.totalSpent : null
            );
        } else {
            setPeriodSpendingsCategory(null);
        }
    }, [filteredTransactions.totalSpent, activeCategory, searchQuery]);

    const removeTransaction = useUserStore(state => state.removeTransaction);
    const onDeleteTransaction = async (transactionId: number) => {
        if (!transactionsList) return false;

        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/transactions/${transactionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                let removedTransaction: Transaction | null = null;
                if (transactionsList) {
                    for (const transactions of Object.values(transactionsList)) {
                        const found = transactions.find(t => t.id === transactionId);
                        if (found) {
                            removedTransaction = found;
                            break;
                        }
                    }
                }

                const updatedTransactionsList = { ...transactionsList };
                Object.entries(updatedTransactionsList).forEach(([date, transactions]) => {
                    const filteredTransactions = transactions.filter(t => t.id !== transactionId);
                    if (filteredTransactions.length > 0) {
                        updatedTransactionsList[date] = filteredTransactions;
                    } else {
                        delete updatedTransactionsList[date];
                    }
                });
                setAllTransactions(updatedTransactionsList);

                const allRemainingTransactions: Transaction[] = [];
                Object.values(updatedTransactionsList).forEach(transactions => {
                    allRemainingTransactions.push(...transactions);
                });

                if (removedTransaction) {
                    removeTransaction(transactionId, allRemainingTransactions, removedTransaction);
                }

                return true;
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    return (
        <SafeAreaView className={'bg-[#f2f0ff] flex h-full justify-start px-4 pt-3'} edges={[]}>
            <View className={'-mx-4 gap-4'}>
                <ScrollView
                    className={'w-full gap-4 flex px-2'}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: GAP, paddingRight: activeCategory ? calculateEndPadding() : 0 }}
                    ref={scrollViewRef as any}
                    scrollEnabled={!activeCategory}
                >
                    {userCategories.map((category, index) => {
                        return (
                            <Animated.View
                                key={`${category.categoryName}-${index}`}
                                style={{
                                    width: widthAnims.current[index],
                                    opacity: opacityAnims.current[index],
                                }}
                            >
                                <TouchableOpacity
                                    className="relative flex flex-row items-start justify-start gap-4 w-full h-[164px] rounded-[24px] p-4 overflow-hidden shadow-sm"
                                    style={{ backgroundColor: category.categoryColor }}
                                    onPress={() => {
                                        setActiveCategory(activeCategory?.categoryName === category.categoryName ? null : category);
                                    }}
                                    disabled={activeCategory !== null && activeCategory.categoryName !== category.categoryName}
                                >
                                    <View className="flex-1 justify-between flex flex-col gap-2">
                                        <View>
                                            <Text className="text-white font-bold text-2xl">
                                                {category.categoryName.split(' ').join('\n')}
                                            </Text>
                                            <Text className="text-white/70 text-sm mt-1">
                                                {category.percentageInAllSpents.toFixed(2)}% of your budget
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="w-2 h-full bg-white/20 rounded-full overflow-hidden">
                                        <View
                                            className="w-full bg-white/70 rounded-full"
                                            style={{
                                                height: `${category.percentageInAllSpents}%`,
                                                alignSelf: 'flex-end',
                                                position: 'absolute',
                                                bottom: 0,
                                            }}
                                        />
                                    </View>
                                    <View className="absolute left-[-16px] bottom-0">
                                        <IconSymbol
                                            name={getShopIcon(category.categoryName) as SFSymbols6_0}
                                            size={64}
                                            color="white"
                                            style={{ opacity: 0.4 }}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </ScrollView>
            </View>
            <View className={'w-full justify-between items-center flex-row flex px-0 pt-4 pb-2'}>
                <View>
                    <Text className={'text-black font-bold text-2xl'}>Transactions</Text>
                </View>
                <View className={'flex flex-col items-end'}>
                    <Text className={'font-bold text-xl'}
                        style={{ color: activeCategory ? activeCategory.categoryColor : '#6b5aed' }}
                    >
                        {(periodSpendingsCateogry !== null ? periodSpendingsCateogry : currentBudget?.spent)?.toFixed(2) || '00.00'}&nbsp;zł
                    </Text>
                    <Text className={'text-gray-500 font-medium text-xs'}>spent this period</Text>
                </View>
            </View>
            <View className={'w-full px-0 pt-2 pb-2'}>
                <View className={'bg-white rounded-2xl flex-row items-center px-4 py-3 gap-3'}>
                    <IconSymbol name="magnifyingglass" size={20} color="#9ca3af" />
                    <TextInput
                        className={'flex-1 text-black'}
                        placeholder="Search transactions..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{ paddingVertical: 4 }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <IconSymbol name="xmark.circle.fill" size={18} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <ScrollView
                className={'flex-1'}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 100,
                    gap: 24,
                }}>
                {fetching ? (
                    <View className={'min-h-[150px] justify-center items-center flex'}>
                        <ActivityIndicator size="large" color="#6b5aed" />
                    </View>
                ) :
                    errorFetch && (
                        <View className={'min-h-[150px] justify-center items-center flex'}>
                            <Text className={'text-red-500'}>{errorFetch}</Text>
                        </View>
                    )
                }
                {!transactionsList && !fetching && !errorFetch && (
                    <Text className={'text-center text-gray-500'}>No transactions found</Text>
                )}
                {!fetching && !errorFetch && filteredTransactions.filtered && Object.keys(filteredTransactions.filtered).length === 0 && transactionsList && (
                    <View className={'min-h-[150px] justify-center items-center flex'}>
                        <Text className={'text-center text-gray-500'}>
                            {activeCategory
                                ? `No transactions found in ${activeCategory.categoryName}`
                                : 'No transactions match your search'}
                        </Text>
                    </View>
                )}
                {!fetching && !errorFetch && filteredTransactions.sortedEntries.map(([date, transactions]) => {
                    const dailyTotal = transactions.reduce((sum, t) => sum + t.amount, 0);

                    return (
                        <View key={date} className={'w-full flex flex-col items-start justify-start'}>
                            <View className={'w-full flex flex-row items-end justify-between'}>
                                <View className="bg-white rounded-t-[24px] py-3 px-4 self-start">
                                    <Text className={'font-bold text-base'}>{formatDateLong(date)}</Text>
                                </View>
                                <Text className={'font-semibold text-xs py-1 text-black/60'}>
                                    -{dailyTotal.toFixed(2)}zł
                                </Text>
                            </View>

                            <Animated.View
                                className={'w-full flex flex-col items-center justify-between gap-4 rounded-b-[24px] rounded-tr-[24px] bg-white p-4'}
                            >
                                {transactions.map((transaction, itemIndex) => (
                                    <React.Fragment key={transaction.id}>
                                        {itemIndex > 0 && (
                                            <View className={'h-[1px] bg-black/5 w-full'}></View>
                                        )}
                                        <TouchableOpacity
                                            className={'w-full flex flex-row items-center justify-between'}
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setSelectedTransaction(transaction);
                                                setDetailModalVisible(true);
                                            }}
                                        >
                                            <View className={'flex flex-row items-center gap-3 h-full'}>
                                                <View className="relative">
                                                    <Image
                                                        source={getLogoSource(transaction.shop.logoUrl)}
                                                        className="w-14 h-14 object-cover overflow-hidden self-center rounded-[12px]"
                                                    />
                                                    <View
                                                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
                                                        style={{ backgroundColor: transaction.shop.categoryColor }}
                                                    >
                                                        <IconSymbol
                                                            name={getShopIcon(transaction.shop.categoryName) as SFSymbols6_0}
                                                            size={12}
                                                            color="white"
                                                        />
                                                    </View>
                                                </View>
                                                <View className={'flex flex-col justify-center gap-1'}>
                                                    <Text className={'font-bold text-base'}>
                                                        {transaction.shop.name}
                                                    </Text>
                                                    <View className="flex flex-row items-center gap-2">
                                                        <Text className={'text-xs text-black/50'}>
                                                            {formatTime(transaction.time)}
                                                        </Text>
                                                        <View className="w-1 h-1 rounded-full bg-black/30" />
                                                        <Text className={'text-xs text-black/50'}>
                                                            {transaction.shop.categoryName}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <Text
                                                className={'text-lg font-bold text-danger'}
                                            >
                                                -
                                                {Math.abs(transaction.amount).toFixed(2)}zł
                                            </Text>
                                        </TouchableOpacity>
                                    </React.Fragment>
                                ))}
                            </Animated.View>
                        </View>
                    );
                })}
            </ScrollView>
            <TransactionDetailModal
                visible={detailModalVisible}
                onClose={handleCloseModal}
                transaction={selectedTransaction}
                onDelete={onDeleteTransaction}
            />
        </SafeAreaView>
    );
}
import DeleteModal from "@/components/DeleteModal";
import TransactionDetailModal from "@/components/TransactionDetailModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from '@/components/ui/Text';
import { getBudgetColorHex } from "@/helpers/helpers";
import { getLogoSource } from "@/helpers/imageHelpers";
import { getShopIcon } from "@/helpers/shopCategoryHelpers";
import { formatDateLong, formatTime } from "@/helpers/timeHelper";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { BudgetCategory, Transaction } from "@/types";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Animated, Image, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { CircularProgressBase } from 'react-native-circular-progress-indicator';
import { SafeAreaView } from "react-native-safe-area-context";
import { SFSymbols6_0 } from "sf-symbols-typescript";
const colors = [
    "#6b5aed",  // Fioletowy (główny kolor aplikacji)
    "#16c47f",  // Zielony (z karty "You saved")
    "#f87171",  // Czerwony (z transakcji)
    "#ffcc4d",  // Żółty (z progress bara)
    "#ff6b9d",  // Różowy
    "#4f46e5",  // Ciemny fiolet
    "#10b981",  // Szmaragdowy
    "#f59e0b",  // Pomarańczowy
    "#ef4444",  // Jasny czerwony
    "#8b5cf6",  // Lawendowy
    "#06b6d4",  // Cyan
    "#ec4899",  // Magenta
];
const availableIcons: SFSymbols6_0[] = [
    "car", "house", "bag", "tshirt", "cart",
    "creditcard", "takeoutbag.and.cup.and.straw",
    "gamecontroller", "cross.case", "airplane",
    "fork.knife", "gift", "laptopcomputer", "heart",
    "camera.aperture", "ticket"
];
export default function BudgetDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { token } = useAuthStore();
    const { setCurrentBudget, setAllTransactions } = useUserStore()
    const removeTransaction = useUserStore(state => state.removeTransaction);
    const allTransactions = useUserStore(state => state.user?.allTransactions);
    const currentBudget = useUserStore(state => state.user?.currentBudget);
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
    const [detailModalVisible, setDetailModalVisible] = React.useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
    const isOthers = params.isOthers === 'true';
    const categoryId = Number(params.id);
    const [settingsExpanded, setSettingsExpanded] = React.useState(false);
    const [deletePending, setDeletePending] = React.useState(false);
    const [editMode, setEditMode] = React.useState(false);
    const { updateSpecificBudgetCategory } = useUserStore()
    const category: BudgetCategory = useMemo(() => {
        if (!isOthers && currentBudget?.budgetCategories) {
            const foundCategory = currentBudget.budgetCategories.find(cat => cat.id === categoryId);
            if (foundCategory) {
                return foundCategory;
            }
        }
        return {
            id: categoryId,
            name: params.name as string,
            iconUri: params.iconUri as string,
            color: params.color as string,
            allocated: Number(params.allocated),
            spent: Number(params.spent),
        };
    }, [currentBudget?.budgetCategories, categoryId, isOthers, params]);
    const [newCategoryName, setNewCategoryName] = React.useState<string>(category?.name);
    const [selectedIcon, setSelectedIcon] = React.useState<SFSymbols6_0>(category?.iconUri as SFSymbols6_0);
    const onChangeCategoryName = useCallback((text: string) => {
        setNewCategoryName(text);
    }, []);
    const [colorEdit, setColorEdit] = React.useState<string>(category.color);
    const [colorEditVisible, setColorEditVisible] = React.useState(false);
    const [budgetEdit, setBudgetEdit] = React.useState<number>(category.allocated);
    const [budgetDisplayValue, setBudgetDisplayValue] = React.useState<string>('');
    const onColorChange = useCallback((color: string) => {
        setColorEdit(color);
    }, []);
    const onBudgetChange = useCallback((budget: string) => {
        let filtered = budget.replace(/[^\d,.]/g, '');

        filtered = filtered.replace(',', '.');

        const parts = filtered.split('.');
        if (parts.length > 2) {
            filtered = parts[0] + '.' + parts.slice(1).join('');
        }

        if (parts.length === 2 && parts[1].length > 2) {
            filtered = parts[0] + '.' + parts[1].substring(0, 2);
        }
        setBudgetDisplayValue(filtered);
        if (filtered === '' || filtered === '.') {
            setBudgetEdit(0);
            return;
        }
        const newBudget = parseFloat(filtered);
        if (!isNaN(newBudget)) {
            setBudgetEdit(newBudget);
        }
    }, []);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const incrementRef = useRef<boolean>(false);
    const counterRef = useRef<number>(0);
    const tickCounterRef = useRef<number>(0);

    const getChangeAmount = useCallback((counter: number): number => {
        if (counter > 40) return 15;
        if (counter > 30) return 10;
        if (counter > 20) return 5;
        if (counter > 10) return 2;
        return 1;
    }, []);

    const startAutoChange = useCallback((increment: boolean) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        incrementRef.current = increment;
        counterRef.current = 0;
        tickCounterRef.current = 0;

        setBudgetDisplayValue('');

        setBudgetEdit(prev => {
            const change = increment ? 1 : -1;
            const newValue = Math.max(0, prev + change);
            return parseFloat(newValue.toFixed(2));
        });

        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                counterRef.current += 1;
                tickCounterRef.current += 1;

                let skipTicks = 10;
                if (counterRef.current > 30) {
                    skipTicks = 1;
                } else if (counterRef.current > 20) {
                    skipTicks = 2;
                } else if (counterRef.current > 10) {
                    skipTicks = 4;
                }

                if (tickCounterRef.current >= skipTicks) {
                    tickCounterRef.current = 0;
                    const changeAmount = getChangeAmount(counterRef.current);

                    setBudgetEdit(prev => {
                        const change = incrementRef.current ? changeAmount : -changeAmount;
                        const newValue = Math.max(0, prev + change);
                        return parseFloat(newValue.toFixed(2));
                    });
                }
            }, 50);
        }, 300);
    }, [getChangeAmount]);

    const stopAutoChange = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        counterRef.current = 0;
        tickCounterRef.current = 0;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAutoChange();
        };
    }, [stopAutoChange]);

    const handleDeleteCategory = async () => {
        try {
            setDeletePending(true);
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/budgetUser/budgetCategory/${categoryId}`, {
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
                router.back();
                return true;
            };
            return false;
        }
        catch (e) {
            console.log('Failed to delete budget category', e);
        }
        finally {
            setDeletePending(false);
        }
    };
    const categoryTransactions: { [date: string]: Transaction[] } = useMemo(() => {
        if (!allTransactions) return {};

        const filtered: { [date: string]: Transaction[] } = {};

        Object.entries(allTransactions).forEach(([date, transactions]) => {
            const categoryTrans = transactions.filter(t => {
                if (isOthers) {
                    return !t.budgetCategory;
                }
                return t.budgetCategory?.id === categoryId;
            });

            if (categoryTrans.length > 0) {
                filtered[date] = categoryTrans;
            }
        });

        return filtered;
    }, [allTransactions, categoryId, isOthers]);

    const props = {
        activeStrokeWidth: 25,
        inActiveStrokeWidth: 25,
    };
    const [isOverviewActive, setIsOverviewActive] = React.useState<boolean>(false);
    const percentageSpent = category.allocated > 0
        ? Math.min(100, (category.spent / category.allocated) * 100)
        : 0;
    const remaining = category.allocated - category.spent;
    useFocusEffect(
        React.useCallback(() => {
            const reopenTransactionId = (global as any).__reopenTransactionId;
            if (reopenTransactionId && allTransactions) {
                let foundTransaction: Transaction | null = null;
                for (const date in allTransactions) {
                    const transaction = allTransactions[date]?.find(t => t.id === reopenTransactionId);
                    if (transaction) {
                        foundTransaction = transaction;
                        break;
                    }
                }
                if (foundTransaction) {
                    setSelectedTransaction(foundTransaction);
                    setDetailModalVisible(true);
                    delete (global as any).__reopenTransactionId;
                }
            }
        }, [allTransactions])
    );

    React.useEffect(() => {
        if (selectedTransaction && allTransactions) {
            let updatedTransaction: Transaction | null = null;
            for (const date in allTransactions) {
                const transaction = allTransactions[date]?.find(t => t.id === selectedTransaction.id);
                if (transaction) {
                    updatedTransaction = transaction;
                    break;
                }
            }
            if (updatedTransaction) {
                setSelectedTransaction(updatedTransaction);
            }
        }
    }, [allTransactions, selectedTransaction?.id]);

    const onDeleteTransaction = async (transactionId: number): Promise<boolean | undefined> => {
        if (!token || !selectedTransaction) return false;

        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/transactions/${transactionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok && allTransactions) {
                let removedTransaction: Transaction | null = null;
                for (const transactions of Object.values(allTransactions)) {
                    const found = transactions.find(t => t.id === transactionId);
                    if (found) {
                        removedTransaction = found;
                        break;
                    }
                }

                const updatedTransactionsList = { ...allTransactions };
                Object.entries(updatedTransactionsList).forEach(([date, transactions]) => {
                    const filteredTransactions = transactions.filter(t => t.id !== transactionId);
                    if (filteredTransactions.length > 0) {
                        updatedTransactionsList[date] = filteredTransactions;
                    } else {
                        delete updatedTransactionsList[date];
                    }
                });

                const allRemainingTransactions: Transaction[] = [];
                Object.values(updatedTransactionsList).forEach(transactions => {
                    allRemainingTransactions.push(...transactions);
                });

                if (removedTransaction) {
                    removeTransaction(transactionId, allRemainingTransactions, removedTransaction);
                }

                router.back();
                return true;
            }
            return false;
        } catch (e) {
            console.log('Failed to delete transaction:', e);
            return false;
        }
    };
    const handleEditCategory = async () => {
        try {
            console.log(JSON.stringify({
                name: newCategoryName,
                allocated: budgetEdit,
                iconUri: selectedIcon,
                color: colorEdit,
            }))
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/budgetUser/edit/budgetCategory`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: categoryId,
                    name: newCategoryName,
                    allocated: budgetEdit,
                    iconUri: selectedIcon,
                    color: colorEdit,
                })
            })
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                updateSpecificBudgetCategory(data);
                setEditMode(false);
            }
        }
        catch (e) {

        }
        finally {
        }
    }
    return (
        <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: deletePending ? '#f5f5f7' : editMode ? colorEdit : category.color }}>
            {deletePending ? (
                <View className={`flex justify-center items-center min-h-[70%]`}>
                    <ActivityIndicator size="large" color="#6B5AED" />
                </View>
            ) : (
                <>
                    <View className={'relative'}>
                        <TouchableOpacity className="px-6 pt-4 min-h-[20%] justify-between" disabled={!editMode} onPress={() => setColorEditVisible(true)}>
                            <View className={`flex-row items-center ${editMode ? 'justify-end' : 'justify-between'}  mb-6`}>
                                {!editMode && (
                                    <TouchableOpacity
                                        onPress={() => router.back()}
                                        className="w-16 h-16 p-2 bg-white/20 rounded-full items-center justify-center"
                                    >
                                        <IconSymbol name="chevron.left" size={24} color="white" weight="bold" />
                                    </TouchableOpacity>
                                )}
                                {!isOthers &&
                                    <View className={`bg-white/20 ${settingsExpanded ? 'items-end' : 'w-16 justify-center'} p-2 h-16 rounded-full items-center  flex flex-row`}>
                                        {settingsExpanded &&
                                            <View className={'mr-2 flex flex-row items-center'}>
                                                {editMode ? (
                                                    <TouchableOpacity
                                                        className={'w-14 h-14 justify-center items-center'}
                                                        onPress={(e) => {
                                                            e.preventDefault()
                                                            setEditMode(false)
                                                        }}
                                                    >
                                                        <IconSymbol
                                                            name={'checkmark'}
                                                            size={24}
                                                            color="white"
                                                            weight={'bold'}
                                                        />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <>
                                                        <TouchableOpacity
                                                            className={'w-14 h-14 justify-center items-center mr-2'}
                                                            onPress={(e) => {
                                                                e.preventDefault()
                                                                setEditMode(true)
                                                            }}
                                                        >
                                                            <IconSymbol
                                                                name={'square.and.pencil'}
                                                                size={24}
                                                                color="white"
                                                                weight={'bold'}
                                                            />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            className={'w-14 h-14 justify-center items-center'}
                                                            onPress={(e) => {
                                                                e.preventDefault()
                                                                setDeleteModalVisible(true)
                                                            }}
                                                        >
                                                            <IconSymbol
                                                                name={'trash'}
                                                                size={24}
                                                                color="white"
                                                                weight={'bold'}
                                                            />
                                                        </TouchableOpacity>
                                                    </>
                                                )}
                                            </View>
                                        }
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.preventDefault();
                                                editMode ? setEditMode(false) : setSettingsExpanded(!settingsExpanded)
                                            }}
                                            className={`${settingsExpanded ? 'w-14 h-14  rounded-full justify-center items-center' : ''}`}
                                        >
                                            {settingsExpanded ? (
                                                <IconSymbol
                                                    name={'xmark'}
                                                    size={24}
                                                    color="white"
                                                    weight={'bold'}
                                                />
                                            ) : (
                                                <IconSymbol
                                                    name={'ellipsis'}
                                                    size={24}
                                                    color="white"
                                                    weight={'bold'}
                                                />
                                            )}

                                        </TouchableOpacity>
                                    </View>
                                }
                            </View>

                            <View className={`flex-row items-center ${editMode ? 'w-[70%]' : 'max-w-[70%]'}`}>
                                {editMode ? (
                                    <TextInput
                                        value={newCategoryName}
                                        onChangeText={onChangeCategoryName}
                                        placeholder="Enter name"
                                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                        className="text-white text-[34px] font-bold border-b-2 border-white/50 px-2 mb-1 w-full"
                                        multiline
                                        onFocus={(e) => e.preventDefault()}
                                        onPress={(e) => e.preventDefault()}
                                    />
                                ) : (
                                    <Text className="text-white text-[36px] font-bold break-words">{category.name}</Text>
                                )
                                }

                            </View>
                            <View className="absolute right-[-16px] bottom-[-16px]">
                                <IconSymbol
                                    name={editMode ? selectedIcon : category.iconUri as SFSymbols6_0}
                                    size={128}
                                    color="white"
                                    style={{ opacity: 0.4 }}
                                />
                            </View>
                        </TouchableOpacity>
                        {colorEditVisible && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 8,
                                    right: 8,
                                    backgroundColor: 'white',
                                    padding: 16,
                                    borderRadius: 32,
                                    marginTop: 8,
                                    shadowColor: "#6b5aed",
                                    shadowOffset: { width: 0, height: 10 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 20,
                                    elevation: 20,
                                    zIndex: 5,
                                }}
                            >
                                <Text className={'mb-4 text-headingMeta'}>Change color</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    {colors.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            className={` rounded-full ${colorEdit === color ? 'w-12 h-12' : ' w-10 h-10'}`}
                                            style={{ backgroundColor: color }}
                                            onPress={() => onColorChange(color)}
                                        />
                                    ))}
                                </ScrollView>
                                <View className={'p-2 flex flex-row items-center justify-center gap-2 w-full mt-4'}>
                                    <TouchableOpacity className={'flex items-center flex-row justify-center gap-2 flex-1 p-3 bg-white rounded-[20px] border border-accent'}
                                        onPress={() => {
                                            setColorEditVisible(false);
                                            setColorEdit(category.color);
                                        }}
                                    >
                                        <Text className="text-accent text-sm font-semibold text-center">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={'flex items-center flex-row gap-2 justify-center flex-1 p-3 bg-accent rounded-[20px] border border-accent'}
                                        onPress={() => {
                                            setColorEditVisible(false);
                                        }}
                                    >
                                        <Text className="text-white text-sm font-semibold text-center">Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    <View className="flex-1 bg-[#f5f5f7] rounded-t-[32px] pt-6 px-6">
                        {editMode ? (
                            <>
                                <View className={'flex flex-col justify-between h-full'}>
                                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16, gap: 16 }} className={'w-full'}>
                                        <View>
                                            <Text className="text-xl text-gray-500 mb-2 font-semibold">Change an icon</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <View className="flex-row gap-2 pb-2">
                                                    {availableIcons.map((icon) => (
                                                        <TouchableOpacity
                                                            key={icon}
                                                            className={`p-3 rounded-full`}
                                                            style={{ backgroundColor: selectedIcon === icon ? colorEdit : '#e5e7eb' }}
                                                            onPress={() => setSelectedIcon(icon)}
                                                        >
                                                            <IconSymbol
                                                                name={icon}
                                                                size={24}
                                                                color={selectedIcon === icon ? 'white' : colorEdit}
                                                            />
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </ScrollView>
                                        </View>
                                        <View>
                                            <Text className="text-xl text-gray-500 mb-2 font-semibold">Change a budget</Text>
                                            <View className={'w-2/3 flex flex-row self-center px-8 py-10 rounded-[20px] items-center justify-center'}
                                                style={{ backgroundColor: colorEdit }}
                                            >
                                                <View className={'bg-[#f5f5f7] rounded-full p-2'}>
                                                    <TouchableOpacity
                                                        className={'rounded-full p-2'}
                                                        style={{ backgroundColor: colorEdit }}
                                                        onPressIn={() => startAutoChange(false)}
                                                        onPressOut={stopAutoChange}
                                                    >
                                                        <IconSymbol name={'minus'} size={24} color={'white'} />
                                                    </TouchableOpacity>
                                                </View>

                                                <View className={'rounded-[20px] text-3xl text-center text-white font-semibold w-full flex flex-row justify-center items-center px-6'}>
                                                    <TextInput
                                                        value={budgetDisplayValue !== '' ? budgetDisplayValue : (budgetEdit === 0 ? '' : budgetEdit.toString())}
                                                        placeholder={'0'}
                                                        keyboardType={'numeric'}
                                                        onChangeText={(text) => onBudgetChange(text)}
                                                        onFocus={() => {
                                                            if (budgetEdit !== 0 && budgetDisplayValue === '') {
                                                                setBudgetDisplayValue(budgetEdit.toString());
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            setBudgetDisplayValue('');
                                                        }}
                                                        className={'text-3xl text-center text-white font-semibold'}
                                                        scrollEnabled
                                                    />
                                                    <Text className={'text-3xl text-white font-semibold ml-2'}>zł</Text>
                                                </View>
                                                <View className={'bg-[#f5f5f7] rounded-full p-2'}>
                                                    <TouchableOpacity
                                                        className={'rounded-full p-2'}
                                                        style={{ backgroundColor: colorEdit }}
                                                        onPressIn={() => startAutoChange(true)}
                                                        onPressOut={stopAutoChange}
                                                    >
                                                        <IconSymbol name={'plus'} size={24} color={'white'} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </ScrollView>
                                    <SafeAreaView edges={['bottom']}>
                                        <View className={'gap-4'}>
                                            <TouchableOpacity className={'w-full border-2 rounded-full p-4'} style={{ borderColor: colorEdit }} onPress={() => setEditMode(false)}>
                                                <Text className={'text-center font-semibold'} style={{ color: colorEdit }}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity className={'w-full border-2 rounded-full p-4'} style={{ backgroundColor: colorEdit, borderColor: colorEdit }} onPress={handleEditCategory}>
                                                <Text className={'text-center text-white font-semibold'}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </SafeAreaView>
                                </View>
                            </>
                        ) : (
                            <>
                                <View className={'bg-white py-2 px-2 items-center justify-center flex-row flex rounded-full'}>
                                    <TouchableOpacity
                                        className={`flex-1 px-6 py-4 rounded-full`}
                                        style={{ backgroundColor: !isOverviewActive ? category.color : 'white' }}
                                        onPress={() => setIsOverviewActive(false)}
                                    >
                                        <Text
                                            className={`text-center ${!isOverviewActive ? 'font-bold' : 'font-semibold'}`}
                                            style={{ color: !isOverviewActive ? 'white' : category.color }}
                                        >
                                            Transactions
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`flex-1 px-6 py-4 rounded-full`}
                                        style={{ backgroundColor: isOverviewActive ? category.color : 'white' }}
                                        onPress={() => setIsOverviewActive(true)}
                                    >
                                        <Text
                                            className={`text-center ${isOverviewActive ? 'font-bold' : 'font-semibold'}`}
                                            style={{ color: isOverviewActive ? 'white' : category.color }}
                                        >
                                            Overview
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {!isOverviewActive &&
                                    <View className={'w-full px-0 pt-2 pb-2'}>
                                        <View className={'bg-white rounded-2xl flex-row items-center px-4 py-3 gap-3'}>
                                            <IconSymbol name="magnifyingglass" size={20} color="#9ca3af" />
                                            <TextInput
                                                className={'flex-1 text-black'}
                                                placeholder="Search transactions..."
                                                placeholderTextColor="#9ca3af"
                                                value={searchQuery}
                                                onChangeText={setSearchQuery}
                                            />
                                            {searchQuery.length > 0 && (
                                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                                    <IconSymbol name="xmark.circle.fill" size={18} color="#9ca3af" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                }
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', gap: 16, paddingBottom: 50, paddingTop: 16 }}>
                                    {isOverviewActive ? (
                                        <>
                                            {isOthers ? (
                                                <View className="w-full gap-4">
                                                    <View
                                                        className="bg-white rounded-3xl px-4 py-2 justify-between"
                                                        style={{
                                                            shadowColor: '#000',
                                                            shadowOpacity: 0.05,
                                                            shadowRadius: 8,
                                                            shadowOffset: { width: 0, height: 2 },
                                                            elevation: 2,
                                                        }}
                                                    >
                                                        <View className="flex-row items-center justify-between py-1">
                                                            <Text className="text-black text-sm font-medium mb-2">Total Spent</Text>
                                                        </View>
                                                        <View className={'mb-2'}>
                                                            <Text className="text-3xl font-bold text-heading">
                                                                {category.spent.toFixed(2)}zł
                                                            </Text>
                                                            <Text className="text-black/40 text-xs font-medium">
                                                                Uncategorized expenses
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Daily Average */}
                                                    <View
                                                        className="bg-white rounded-3xl px-4 py-2 justify-between border border-black/5"
                                                        style={{
                                                            shadowColor: '#000',
                                                            shadowOpacity: 0.05,
                                                            shadowRadius: 8,
                                                            shadowOffset: { width: 0, height: 2 },
                                                            elevation: 2,
                                                        }}
                                                    >
                                                        <View className={'flex flex-row justify-between items-center py-1'}>
                                                            <Text className="text-black text-sm font-medium mb-2" >Daily average</Text>
                                                        </View>
                                                        <View className={'mb-2'}>
                                                            <Text className="text-3xl font-bold text-heading">
                                                                {(category.spent / new Date().getDate()).toFixed(2)}zł
                                                            </Text>
                                                            <Text className="text-black/40 text-xs font-medium">
                                                                Based on current month
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View
                                                        className=" rounded-3xl px-4 py-4"
                                                    >
                                                        <View className="flex-row flex gap-3 items-center justify-center">
                                                            <View className="flex-1">
                                                                <Text className="text-heading text-sm font-semibold mb-1 text-center">
                                                                    Uncategorized transactions
                                                                </Text>
                                                                <Text className="text-headingMeta text-xs text-center">
                                                                    These transactions don&apos;t have a budget category assigned. Consider assigning them to track your spending better.
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            ) : (
                                                <>
                                                    <View className="items-center mb-6">
                                                        <CircularProgressBase
                                                            {...props}
                                                            value={percentageSpent}
                                                            radius={125}
                                                            activeStrokeColor={category.color}
                                                            inActiveStrokeColor={'white'}
                                                            rotation={0}
                                                            clockwise={false}
                                                        >
                                                            <View className="items-center">
                                                                <Text className={'font-bold text-4xl'} style={{ color: getBudgetColorHex(category.spent, category.allocated) }}>
                                                                    {category.spent.toFixed(2)}zł
                                                                </Text>
                                                                <Text className="text-gray-500 text-sm mt-1">
                                                                    of {category.allocated.toFixed(2)}zł
                                                                </Text>
                                                            </View>
                                                        </CircularProgressBase>
                                                    </View>

                                                    <View className="w-full gap-4">
                                                        <View
                                                            className="bg-white rounded-3xl px-4 py-2 justify-between"
                                                            style={{
                                                                shadowColor: '#000',
                                                                shadowOpacity: 0.05,
                                                                shadowRadius: 8,
                                                                shadowOffset: { width: 0, height: 2 },
                                                                elevation: 2,
                                                            }}
                                                        >
                                                            <View className="flex-row items-center justify-between py-1">
                                                                <View>
                                                                    <Text className="text-black text-sm font-medium mb-2">Remaining</Text>
                                                                </View>
                                                            </View>
                                                            <View className={'mb-2'}>
                                                                <Text className="text-3xl font-bold" style={{ color: getBudgetColorHex(category.spent, category.allocated) }}>
                                                                    {remaining.toFixed(2)}zł
                                                                </Text>
                                                                <Text className="text-black/40 text-xs font-medium">
                                                                    {percentageSpent.toFixed(1)}% of budget spent
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <View className="flex-row gap-4">
                                                            <View
                                                                className="flex-1 bg-white rounded-3xl px-4 py-2 justify-between"
                                                                style={{
                                                                    shadowColor: '#000',
                                                                    shadowOpacity: 0.05,
                                                                    shadowRadius: 8,
                                                                    shadowOffset: { width: 0, height: 2 },
                                                                    elevation: 2,
                                                                }}
                                                            >
                                                                <View className={'flex flex-row justify-between items-center py-1'}>
                                                                    <Text className="text-black text-sm font-medium mb-b" >Allocated</Text>
                                                                </View>
                                                                <View className={'mb-2'}>
                                                                    <Text className="text-2xl font-bold" style={{ color: category.color }}>
                                                                        {category.allocated.toFixed(2)}zł
                                                                    </Text>
                                                                    <Text className="text-xs font-bold text-black/50">
                                                                        You&#39;re budget was
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            {/* Spent */}
                                                            <View
                                                                className="flex-1 bg-white rounded-3xl px-4 py-2 justify-between"
                                                                style={{
                                                                    shadowColor: '#000',
                                                                    shadowOpacity: 0.05,
                                                                    shadowRadius: 8,
                                                                    shadowOffset: { width: 0, height: 2 },
                                                                    elevation: 2,
                                                                }}
                                                            >
                                                                <View className={'flex flex-row justify-between items-center py-1'}>
                                                                    <Text className="text-black text-sm font-medium mb-2" >Spent</Text>
                                                                </View>
                                                                <View className={'mb-2'}>
                                                                    <Text className="text-2xl font-bold" style={{ color: getBudgetColorHex(category.spent, category.allocated) }}>
                                                                        {category.spent.toFixed(2)}zł
                                                                    </Text>
                                                                    <Text className="text-xs font-bold text-black/50">
                                                                        You&#39;ve spent {percentageSpent.toFixed(1)}%
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </View>

                                                        {/* Daily Average */}
                                                        <View
                                                            className="bg-white rounded-3xl px-4 py-2 justify-between border border-black/5"
                                                            style={{
                                                                shadowColor: '#000',
                                                                shadowOpacity: 0.05,
                                                                shadowRadius: 8,
                                                                shadowOffset: { width: 0, height: 2 },
                                                                elevation: 2,
                                                            }}
                                                        >
                                                            <View className={'flex flex-row justify-between items-center py-1'}>
                                                                <Text className="text-black text-sm font-medium mb-2" >Daily average</Text>
                                                            </View>
                                                            <View className={'mb-2'}>
                                                                <Text className="text-3xl font-bold" style={{ color: category.color }}>
                                                                    {(category.spent / new Date().getDate()).toFixed(2)}zł
                                                                </Text>
                                                                <Text className="text-black/40 text-xs font-medium">
                                                                    Based on current month
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <View className={'w-full flex flex-col items-center justify-center gap-6'}>
                                            {Object.entries(categoryTransactions).length === 0 ? (
                                                <View className="w-full bg-white rounded-3xl p-6 items-center justify-center">
                                                    <IconSymbol name="tray" size={48} color="#9ca3af" />
                                                    <Text className="text-gray-400 text-lg font-semibold mt-4">No transactions yet</Text>
                                                    <Text className="text-gray-400 text-sm text-center mt-2">
                                                        Transactions in this category will appear here
                                                    </Text>
                                                </View>
                                            ) : (
                                                Object.entries(categoryTransactions).map(([date, dayTransactions]) => {
                                                    const dailyTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

                                                    return (
                                                        <View key={date} className={'w-full flex flex-col items-start justify-start'}>
                                                            {/* Date Badge */}
                                                            <View className={'w-full flex flex-row items-center justify-between'}>
                                                                <View className="bg-white rounded-t-[24px] px-4 py-2 self-start">
                                                                    <Text className={'font-bold text-base'}>{formatDateLong(date)}</Text>
                                                                </View>
                                                                <Text className={'font-semibold text-xs text-black/60'}>
                                                                    -{dailyTotal.toFixed(2)} zł
                                                                </Text>
                                                            </View>

                                                            {/* Transactions Card */}
                                                            <Animated.View
                                                                className={'w-full flex flex-col items-center justify-between gap-4 rounded-b-[24px] rounded-tr-[24px] bg-white p-4'}
                                                            >
                                                                {dayTransactions.map((transaction, itemIndex) => (
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
                                                                                        className="w-14 h-14 object-contain overflow-hidden self-center rounded-[12px]"
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
                                                                                    <Text className={'font-bold text-base'}>{transaction.shop.name}</Text>
                                                                                    <View className="flex flex-row items-center gap-2">
                                                                                        <Text className={'text-xs text-black/50'}>{formatTime(transaction.time)}</Text>
                                                                                        <View className="w-1 h-1 rounded-full bg-black/30" />
                                                                                        <Text className={'text-xs text-black/50'}>{transaction.shop.categoryName}</Text>
                                                                                    </View>
                                                                                </View>
                                                                            </View>
                                                                            <Text className={'text-lg font-bold'} style={{
                                                                                color: '#f87171'
                                                                            }}>
                                                                                -{transaction.amount.toFixed(2)}zł
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    </React.Fragment>
                                                                ))}
                                                            </Animated.View>
                                                        </View>
                                                    );
                                                })
                                            )}
                                        </View>
                                    )}
                                </ScrollView>
                            </>
                        )}
                    </View>
                </>)}
            <TransactionDetailModal
                visible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                transaction={selectedTransaction}
                onDelete={onDeleteTransaction}
            />
            <DeleteModal visible={deleteModalVisible} onClose={() => { setDeleteModalVisible(false); }} onDelete={handleDeleteCategory} budgetCategory={category} />

        </SafeAreaView>
    )
}
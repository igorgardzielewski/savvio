import {
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Image,
    Modal,
    Switch,
    Keyboard,
    TouchableWithoutFeedback, ActivityIndicator
} from "react-native";
import { Text } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, {useState, useEffect, useRef} from "react";
import {IconSymbol} from "@/components/ui/icon-symbol";
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import {BudgetCategory, Transaction, Shop} from "@/types";
import dayjs from 'dayjs';
import {LinearGradient} from "expo-linear-gradient";
import { TimerPicker } from "react-native-timer-picker";
import {useUserStore} from "@/store/userStore";
import {useAuthStore} from "@/store/authStore";
import ReceiptItemRow from '@/components/ReceiptItemRow';
import CategoryPill from '@/components/budget/CategoryPill';
import {getLogoSource} from "@/helpers/imageHelpers";

type LocalReceiptItemData = {
    id: number;
    name: string;
    quantity: string;
    unit: string;
    amount: string;
}

export default function ManuallyAdd() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const defaultStyles = useDefaultStyles();
    const [editMode, setEditMode] = useState(false);
    const transactionData: Transaction | null = params.transactionData ? JSON.parse(params.transactionData as string) : null;

    useEffect(() => {
        if(transactionData?.id) setEditMode(true);
    }, [transactionData]);

    const parseTimeString = (timeStr: string | undefined): {hours: number, minutes: number} | null => {
        if (!timeStr) return null;
        const parts = timeStr.split(':');
        if (parts.length < 2) return null;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        if (isNaN(hours) || isNaN(minutes)) return null;
        return { hours, minutes };
    };

    const [isReceipt, setIsReceipt] = useState(!!transactionData?.receiptPositions?.length);
    const [shopQuery, setShopQuery] = useState(transactionData?.shop?.name || '');
    const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(transactionData?.budgetCategory || null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [toggleShop, setToggleShop] = useState(false);
    const [toggleTime, setToggleTime] = useState(false);

    const parsedTime = parseTimeString(transactionData?.time);
    const [selectedTime, setSelectedTime] = useState<{hours: number, minutes: number} | null>(parsedTime);
    const [tempSelectedTime, setTempSelectedTime] = useState<{hours: number, minutes: number} | null>(parsedTime);

    const [selectedShop, setSelectedShop] = useState<Shop | null>(transactionData?.shop || null);
    const [totalPrice, setTotalPrice] = useState(transactionData?.amount?.toString() || "0.00");

    const initialReceiptItems: LocalReceiptItemData[] = Array.isArray(transactionData?.receiptPositions) && transactionData.receiptPositions.length
        ? transactionData.receiptPositions.map((item, index) => ({
            id: item.id || index + 1,
            name: item.name || '',
            quantity: item.quantity?.toString() || '',
            unit: item.unit || 'pcs',
            amount: item.totalItemPrice?.toFixed(2) || '0.00',
        }))
        : [];

    const [receiptItems, setReceiptItems] = useState<LocalReceiptItemData[]>(initialReceiptItems);
    const currentBudget = useUserStore(state => state.user?.currentBudget ?? null);
    const rawCategories = currentBudget?.budgetCategories;
    const budgetCategories = Array.isArray(rawCategories) ? rawCategories.filter(Boolean) : [];
    const [nextItemId, setNextItemId] = useState(
        initialReceiptItems.length > 0
            ? Math.max(...initialReceiptItems.map(i => i.id)) + 1
            : 1
    );

    const initialSelected: DateType = transactionData?.date ? new Date(transactionData.date) : undefined;
    const [selected, setSelected] = useState<DateType>(initialSelected);
    const {token} = useAuthStore();
    const {addTransaction,updateTransaction} = useUserStore()
    const [initialShops,setInitialShops] = useState<Shop[]>([]);
    const shopNameScrollRef = useRef<ScrollView | null>(null);
    const [searchedShops,setSearchedShops] = useState<Shop[]>([])
    const [searchedShopsLoading,setSearchedShopsLoading] = useState(false);
    const [initialShopsLoading,setInitialShopsLoading] = useState(false);
    useEffect(() => {
        if(!token) return;
        setInitialShopsLoading(true);
        const fetchInitialShops = async ()=> {
            try {
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/shops/get-random`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                })
                if (!res.ok) {
                    console.log('Failed to fetch initial shops');
                    return;
                }
                const data = await res.json();
                setInitialShops(data);
            }
            catch(err){
                console.log('Failed to fetch initial shops', err);
            }
            finally{
                setInitialShopsLoading(false);
            }
        }
        fetchInitialShops();
    }, [token]);
    const [showNoBudgetCategoryModal, setShowNoBudgetCategoryModal] = useState(false);
    const [dateError, setDateError] = useState('');
    const [timeError, setTimeError] = useState('');
    const [receiptPositionErrors, setReceiptPositionErrors] = useState('');
    const [shopError, setShopError] = useState('');
    const [pendingTransaction, setPendingTransaction] = useState(false);
    const [transactionFailed, setTransactionFailed] = useState(false);
    const validateTimeAndDate = () => {
        if (!selected) {
            setDateError('Please select a date');
        }
        if (!selectedTime) {
            setTimeError('Please select a time');
        }
        if(isReceipt && !receiptItems.length){
            setReceiptPositionErrors('Please add at least one receipt position or remove the receipt option');
        }
        if(!selectedShop)
        {
            setShopError('Please select a shop');
        }
        return !(!selected || !selectedTime || (isReceipt && !receiptItems.length) || !selectedShop);
    }

    const clearErrors = () => {
        setDateError('');
        setTimeError('');
        setReceiptPositionErrors('');
        setTransactionFailed(false);
    }
    const handleCreateTransaction = async (skipCategory: boolean = false) => {
        clearErrors();
        setPendingTransaction(true);
        if(!validateTimeAndDate()) {
            setPendingTransaction(false);
            return;
        }
        if(!selectedCategory && !skipCategory)
        {
            setShowNoBudgetCategoryModal(true);
            setPendingTransaction(false);
            return;
        }
        const payload = JSON.stringify({
            budgetCategoryId: selectedCategory ? selectedCategory.id : null,
            shopId: selectedShop ? selectedShop.id : null,
            amount: isReceipt ? parseFloat(calculateTotal()) : parseFloat(totalPrice.replace(/,/g, '.')),
            date: selected ? dayjs(selected).format('YYYY-MM-DD') : null,
            time: selectedTime ? {hours: selectedTime.hours, minutes: selectedTime.minutes} : null,
            receiptPositions: isReceipt ? receiptItems.map((item) => ({
                name: item.name,
                quantity: parseFloat(item.quantity.replace(/,/g, '.')),
                unit: item.unit,
                totalItemPrice: parseFloat(item.amount.replace(/,/g, '.')),
            })) : [],
        });
        try {
            const base = `${process.env.EXPO_PUBLIC_API_URL}/api/transactions`;
            const url = editMode ? `${base}/${transactionData?.id}` : `${base}/create`;
            const method = editMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: payload,
            });

            if (!res.ok) {
                console.log(res);
                setTransactionFailed(true);
                console.log('Failed to create transaction');
                return;
            }
            const data : Transaction = await res.json();

            if (editMode) {
                updateTransaction(data.id, data, transactionData);
                // Store transaction ID globally to reopen modal after navigation
                (global as any).__reopenTransactionId = data.id;
                router.back();
            } else {
                addTransaction(data);
                router.push('/(tabs)');
            }
        }
        catch (err) {
            console.log('Failed to create transaction', err);
        }
        finally{
            setPendingTransaction(false);
        }
    }
    const handlePriceChange = (text: string) => {
        let normalized = text.replace(/,/g, '.');
        normalized = normalized.replace(/[^0-9.]/g, '');
        const firstDotIndex = normalized.indexOf('.');
        if (firstDotIndex !== -1) {
            const integer = normalized.slice(0, firstDotIndex);
            let fraction = normalized.slice(firstDotIndex + 1).replace(/\./g, '');
            if (fraction.length > 2) {
                fraction = fraction.slice(0, 2);
            }
            normalized = integer + '.' + fraction;
        }
        setTotalPrice(normalized);
    };

    const calculateTotal = () => {
        const total = receiptItems.reduce((sum, item) => {
            const quantity = parseFloat(item.quantity.replace(/,/g, '.')) || 0;
            const amount = parseFloat(item.amount.replace(/,/g, '.')) || 0;
            return sum + (quantity * amount);
        }, 0);
        return total.toFixed(2);
    };

    const addReceiptItem = () => {
        const newItem: LocalReceiptItemData = {
            id: nextItemId,
            name: '',
            quantity: '',
            unit: 'pcs',
            amount: ''
        };
        setReceiptPositionErrors('')
        setReceiptItems([...receiptItems, newItem]);
        setNextItemId(nextItemId + 1);
    };

    const updateReceiptItem = (id: number, field: keyof LocalReceiptItemData, value: string) => {
        setReceiptItems(receiptItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const deleteReceiptItem = (id: number) => {
        setReceiptItems(receiptItems.filter(item => item.id !== id));
    };

    const selectShop = (shop: Shop) => {
        setSelectedShop(shop);
        setShopQuery(shop.name);
        setToggleShop(false);
    }
    const searchByShopQuery = React.useCallback(async (query: string) => {
        if(!toggleShop && selectedShop) return;
        try{
            setSearchedShopsLoading(true);
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/shops/search?query=${query.trim()}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })
            if(!res.ok){
                console.log('Failed to fetch shops');
                return;
            }
            const data = await res.json();
            setSearchedShops(data);
        }
        catch (err)
        {
            console.log('Failed to fetch shops', err);
        }
        finally{
            setSearchedShopsLoading(false);
        }
    }, [toggleShop, selectedShop, token]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (shopQuery.trim().length > 0) {
                searchByShopQuery(shopQuery);
            } else {
                setSearchedShops([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [shopQuery, searchByShopQuery]);

    const pad = (n: number) => n.toString().padStart(2, '0');

    const renderTimeLabel = (t: { hours: number; minutes: number } | null) => {
        if (t === null || t === undefined) return 'Time';
        return `${pad(t.hours)}:${pad(t.minutes)}`;
    };

    const filteredShops = shopQuery.trim() === '' ? initialShops : searchedShops;

    useEffect(() => {
        if (selectedShop) {
            setTimeout(() => {
                try {
                    shopNameScrollRef.current?.scrollTo({ x: 0, animated: false });
                } catch (e) {
                    console.debug(e);
                }
            }, 0);
        }
    }, [selectedShop]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }} accessible={false}>
                <View style={{ flex: 1 }}>
                    <LinearGradient
                        colors={['#eae8ff', '#e2deff']}
                        start={{x: 0, y: 0}}
                        end={{x: 0, y: 0.9}}
                        style={{ flex: 1, gap: 24 }}
                    >
                        <SafeAreaView className="flex-1" edges={['top']}>
                            <View className="flex-1 justify-between">
                                <View className={'flex flex-row justify-between items-center px-6'}>
                                    <TouchableOpacity className={'bg-white p-4 rounded-full'} onPress={() => router.back()}>
                                        <IconSymbol name="arrow.left" size={24} weight={'bold'} color="#6b5aed" />
                                    </TouchableOpacity>
                                    <Text className="text-heading font-semibold text-3xl">{editMode ? 'Edit Transaction' : 'Add Transaction'}</Text>
                                </View>
                                {transactionFailed && (<Text className="text-red-500 text-center mt-2 text-lg font-medium">Failed to add transaction. Please try again.</Text>)}
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ justifyContent: "center",paddingHorizontal: 16, gap: 24, marginTop:24, paddingBottom: 50 }}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingHorizontal: -8, alignItems: 'center', gap: 8 }}
                                    >
                                        {budgetCategories.map((category) => (
                                            <CategoryPill
                                                key={category.id}
                                                category={category}
                                                selectedCategory={selectedCategory}
                                                onPress={() => setSelectedCategory(prev => (prev?.id === category.id ? null : category))}
                                            />
                                        ))}
                                    </ScrollView>
                                    <View>
                                    <View className={`bg-white ${isCalendarOpen ? 'rounded-[34px]' : 'rounded-[24px]'} shadow-sm ${dateError ? 'border-2 border-red-500' : ''}`}>
                                        {isCalendarOpen
                                            ? (
                                                <DateTimePicker
                                                    mode="single"
                                                    className={'bg-white rounded-[34px] p-4'}
                                                    navigationPosition={'right'}
                                                    date={selected}
                                                    maxDate={new Date()}
                                                    onChange={({ date }) => {
                                                        setDateError('');
                                                        setSelected(date);
                                                        setIsCalendarOpen(false)
                                                    }}
                                                    disableMonthPicker={true}
                                                    disableYearPicker={true}
                                                    styles={{
                                                        ...defaultStyles,
                                                        today: { backgroundColor: '#e2deff80', borderRadius: 1000 },
                                                        selected: { backgroundColor: '#6b5aed', borderRadius: 1000 },
                                                        selected_label: { color: 'white' },
                                                        button_next: {
                                                            backgroundColor: 'white',
                                                            padding: 8,
                                                            borderRadius: 1000,
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.1,
                                                            shadowRadius: 4,
                                                            elevation: 3,
                                                        },
                                                        button_prev: {
                                                            backgroundColor: 'white',
                                                            padding: 8,
                                                            borderRadius: 1000,
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.1,
                                                            shadowRadius: 4,
                                                            elevation: 3,
                                                        },
                                                    }}
                                                />
                                            ):(
                                                <TouchableOpacity className={`flex flex-row w-full items-center p-6 `} onPress={() => setIsCalendarOpen(true)}>
                                                    <View className={`flex flex-row items-center justify-between w-full`}>
                                                        <IconSymbol name={'calendar'} color={'#6B7280'} weight={'bold'} size={24} />
                                                        <Text className={`${selected ? 'text-black' : 'text-heading'} font-medium text-lg`}>
                                                            {selected ? dayjs(selected).format('DD MMMM YYYY') : 'Select date'}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                    </View>
                                        {dateError ? <Text className="text-red-500 text-sm ml-2">{dateError}</Text> : null}
                                    </View>
                                    <View className={'w-full flex flex-row gap-2 items-start justify-between'}>
                                        <View className={'flex-1 w-full flex flex-col items-start'}>
                                        <View className={`p-6 bg-white rounded-[24px] flex flex-col items-center shadow-sm gap-6 ${shopError ? 'border-2 border-red-500' : ''}`}>
                                            {toggleShop ? (
                                                <View className={'flex flex-col w-full'}>
                                                    <View className={'flex flex-row w-full items-center'}>
                                                        <IconSymbol name={'cart'} color={'#6B7280'} weight={'bold'} size={24} />
                                                        <TextInput
                                                            value={shopQuery}
                                                            onChangeText={setShopQuery}
                                                            className="text-base font-medium text-black ml-2"
                                                            style={{
                                                                fontFamily: 'Inter',
                                                                flex: 1,
                                                                padding: 0,
                                                                margin: 0,
                                                                lineHeight: 18,
                                                                fontSize: 16,
                                                                includeFontPadding: false,
                                                                textAlignVertical: 'center',
                                                            }}
                                                            autoCapitalize="none"
                                                            placeholder="Type shop"
                                                            placeholderTextColor="#999"
                                                            keyboardType="default"
                                                            underlineColorAndroid="transparent"
                                                            onFocus={() => {setToggleShop(true); setShopError('')}}
                                                        />
                                                    </View>
                                                    <View className={'rounded-b-[24px] flex flex-col items-start gap-4 mt-2 w-full'}>
                                                        <ScrollView style={{ maxHeight: 180,width:'100%' }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0 }} >
                                                            {(initialShopsLoading || searchedShopsLoading) ?
                                                                ( <ActivityIndicator size="small" color="#6B7280" />
                                                                ) :
                                                                (filteredShops.map((shop, index) => (
                                                                <React.Fragment key={index}>
                                                                    {index>0 && <View className="h-[1px] w-full bg-black/10" />}
                                                                    <TouchableOpacity
                                                                        className="w-full flex-row items-center justify-between py-3"
                                                                        activeOpacity={0.7}
                                                                        onPress={() => {selectShop(shop)}}
                                                                    >
                                                                        <View className="flex-row items-center gap-3">
                                                                            <Image
                                                                                source={getLogoSource(shop.logoUrl)}
                                                                                className="w-10 h-10 rounded-[12px]"
                                                                            />
                                                                            <View>
                                                                                <Text className="text-black font-semibold">{shop.name}</Text>
                                                                                <Text className="text-black/50 text-xs">{shop.categoryName}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                </React.Fragment>
                                                            )))}

                                                            {filteredShops.length === 0 && (
                                                                <View className="py-4 px-2">
                                                                    <Text className="text-sm text-gray-500">No shops found</Text>
                                                                </View>
                                                            )}
                                                        </ScrollView>
                                                    </View>
                                                </View>
                                            ) : selectedShop ? (
                                                <View className={'flex flex-row w-full -my-2 items-center justify-between gap-3'}>
                                                    {/* left side: reserve space on the right so text won't go under the X button */}
                                                    <TouchableOpacity
                                                        onPress={() => {setToggleShop(true); setShopError('')}}
                                                        className={'flex-row items-center gap-3'}
                                                        style={{ flex: 1 }}
                                                        activeOpacity={0.8}
                                                    >
                                                        <Image
                                                            source={getLogoSource(selectedShop.logoUrl)}
                                                            className="w-11 h-11 rounded-[12px]"
                                                        />
                                                        {/* horizontal scroll for long shop names; allow user to swipe right */}
                                                        <ScrollView
                                                            horizontal
                                                            ref={(r) => { shopNameScrollRef.current = r; }}
                                                            showsHorizontalScrollIndicator={false}
                                                            nestedScrollEnabled
                                                            contentContainerStyle={{ alignItems: 'center' }}
                                                            style={{ maxWidth: '100%' }}
                                                        >
                                                            <Text
                                                                className={`text-black font-medium text-lg`}
                                                                numberOfLines={1}
                                                                ellipsizeMode="tail"
                                                                style={{ flexShrink: 1, paddingRight: 8 }}
                                                            >
                                                                {selectedShop.name}
                                                            </Text>
                                                        </ScrollView>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setSelectedShop(null);
                                                            setShopQuery('');
                                                            setSearchedShops([]);
                                                            setToggleShop(false);
                                                        }}
                                                        accessibilityLabel="Clear selected shop"
                                                        style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <IconSymbol name={'xmark'} color={'#6B7280'} weight={'bold'} size={20} />
                                                    </TouchableOpacity>
                                                </View>
                                             ) : (
                                                <TouchableOpacity className={'flex flex-row w-full justify-between'} onPress={() => {setToggleShop(true);setShopError('')}}>
                                                    <IconSymbol name={'cart'} color={'#6B7280'} weight={'bold'} size={24} />
                                                    <Text className={`${selected ? 'text-black' : 'text-heading'} font-medium text-lg`}>
                                                        &nbsp;Select shop
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                            {shopError ? <Text className="text-red-500 text-sm">{shopError}</Text> : null}
                                        </View>
                                        <View className={'flex-[0.6] w-full flex flex-col items-end'}>
                                            <TouchableOpacity
                                                className={`p-6 bg-white rounded-[24px] shadow-sm flex flex-row items-center justify-between ${timeError ? 'border-2 border-red-500' : ''}`}
                                                onPress={() => {
                                                    const now = new Date();
                                                    setTempSelectedTime(selectedTime || { hours: now.getHours(), minutes: now.getMinutes() });
                                                    setToggleTime(true);
                                                }}
                                            >
                                                <IconSymbol name={'clock'} color={'#6B7280'} weight={'bold'} size={24} />
                                                <Text className={`${selectedTime ? 'text-black' : 'text-heading'} font-medium text-lg`}>
                                                    &nbsp;{renderTimeLabel(selectedTime)}
                                                </Text>
                                            </TouchableOpacity>
                                            {timeError ? <Text className="text-red-500 text-sm">{timeError}</Text> : null}
                                        </View>
                                    </View>
                                    <View className={`bg-white p-6 rounded-[24px] shadow-sm gap-6 flex-col flex ${receiptPositionErrors ? 'border-2 border-red-500' : ''}`}>
                                        <View className={'flex flex-row items-center justify-between'}>
                                            <View className={'flex flex-col'}>
                                                <Text className={'font-medium text-heading text-lg'}>Add a receipt</Text>
                                                <Text className={'text-headingMeta text-sm'}>Have receipt? Add positions manually.</Text>
                                            </View>
                                            <Switch
                                                trackColor={{ false: "#d1d5db", true: "#6b5aed" }}
                                                thumbColor={isReceipt ? "#ffffff" : "#f4f3f4"}
                                                ios_backgroundColor="#d1d5db"
                                                onValueChange={()=>{setIsReceipt(!isReceipt); setReceiptPositionErrors('');}}
                                                value={isReceipt}
                                            />
                                        </View>
                                        {isReceipt &&
                                            <TouchableOpacity className={'shadow-sm p-4 justify-center w-full items-center bg-white rounded-[24px]'} onPress={() => router.push('/(addexpense)/ScanReceipt')}>
                                                <IconSymbol name={'camera'} color={'#6b5aed'} weight={'bold'} size={32} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                    {isReceipt && (
                                        <View className={`bg-white p-6 rounded-[24px] shadow-sm gap-6 ${receiptPositionErrors ? 'border-2 border-red-500' : ''}`}>
                                            <View className="w-full">
                                                {/* Logo - positioned above modal */}
                                                {selectedShop && (
                                                    <View className="items-center mb-[-32px] z-10">
                                                        <View
                                                            style={{
                                                                shadowColor: "#000",
                                                                shadowOpacity: 0.2,
                                                                shadowRadius: 8,
                                                                shadowOffset: { width: 0, height: 4 },
                                                                elevation: 8,
                                                            }}
                                                            className="bg-white rounded-2xl"
                                                        >
                                                            <Image
                                                                source={getLogoSource(selectedShop.logoUrl)}
                                                                className="w-16 h-16 object-contain rounded-[12px]"
                                                            />
                                                        </View>
                                                    </View>
                                                )}

                                                <View
                                                    style={{
                                                        shadowColor: "#000",
                                                        shadowOpacity: 0.3,
                                                        shadowRadius: 16,
                                                        shadowOffset: { width: 0, height: 8 },
                                                        elevation: 10,
                                                        marginTop:8,
                                                    }}
                                                    className="bg-white rounded-t-3xl pt-12 px-6 pb-6"
                                                >
                                                    {/* Merchant Header */}
                                                    {selectedShop && <View className="items-center mb-4">
                                                        <Text
                                                            className="text-2xl font-bold text-black"
                                                            style={{letterSpacing: 1.5}}
                                                        >
                                                            {selectedShop.name.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    }

                                                    {/* Items Header */}
                                                    <View className="flex-row justify-between items-center mb-2 pb-1 border-b border-gray-200">
                                                        <Text className="text-xs font-bold text-gray-600 flex-1">ITEM</Text>
                                                        <Text className="text-xs font-bold text-gray-600 w-[28%] text-center">QTY</Text>
                                                        <Text className="text-xs font-bold text-gray-600 w-[20%] text-right">AMOUNT</Text>
                                                        <View className="w-6 ml-2" />
                                                    </View>

                                                    {/* Items */}
                                                    <ScrollView style={{ maxHeight: 200 }}>
                                                        {receiptItems.map((item) => (
                                                            <ReceiptItemRow
                                                                key={item.id}
                                                                item={item}
                                                                onUpdate={updateReceiptItem}
                                                                onDelete={deleteReceiptItem}
                                                            />
                                                        ))}
                                                    </ScrollView>

                                                    {/* Add Item Button */}
                                                    <TouchableOpacity
                                                        onPress={addReceiptItem}
                                                        className="flex-row items-center justify-center gap-2 mt-4 py-3 bg-gray-50 rounded-xl"
                                                    >
                                                        <IconSymbol name="plus" size={18} weight="bold" color="#6b5aed" />
                                                        <Text className="text-accent font-semibold">Add Item</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                <View className="flex-row justify-between bg-transparent w-full overflow-hidden">
                                                    {Array.from({ length: 16 }).map((_, i) => (
                                                        <View
                                                            key={i}
                                                            className={'flex-1'}
                                                            style={{
                                                                width: 0,
                                                                height: 0,
                                                                backgroundColor: 'transparent',
                                                                borderStyle: 'solid',
                                                                borderLeftWidth: 12,
                                                                borderRightWidth: 12,
                                                                borderTopWidth: 10,
                                                                borderLeftColor: 'transparent',
                                                                borderRightColor: 'transparent',
                                                                borderTopColor: 'white',
                                                            }}
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>

                                {/* Bottom sheet */}
                                <View className="bg-white rounded-t-[32px] p-4 gap-4 shadow">
                                    <View className="flex flex-row justify-between items-end">
                                        <Text className="font-bold text-2xl text-heading">Total</Text>
                                        <View className="flex flex-row items-center justify-center gap-2">
                                            {!isReceipt ? (
                                                <>
                                                    <IconSymbol size={16} name="pencil" color="#414054" weight="bold" />
                                                    <TextInput
                                                        value={totalPrice}
                                                        onChangeText={handlePriceChange}
                                                        className="py-1 text-2xl font-medium text-black"
                                                        style={{
                                                            fontFamily: 'Inter',
                                                            minWidth: 80,
                                                        }}
                                                        placeholder="0.00"
                                                        placeholderTextColor="#999"
                                                        keyboardType="decimal-pad"
                                                        textAlign="right"
                                                    />
                                                    <Text className="text-2xl font-medium self-end text-black">zł</Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Text className="text-2xl font-medium text-black text-right">{calculateTotal()}</Text>
                                                    <Text className="text-2xl font-medium self-end text-black">zł</Text>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    <SafeAreaView edges={['bottom']}>
                                        <TouchableOpacity className={`${pendingTransaction ? 'bg-accent/50' : 'bg-accent'} rounded-full px-6 py-6 items-center justify-center`} onPress={() => handleCreateTransaction(false)}>
                                            {pendingTransaction ? <ActivityIndicator color={'#6B5AED'}/> : <Text className="text-white text-xl font-semibold">Add expense</Text>}
                                        </TouchableOpacity>
                                    </SafeAreaView>
                                </View>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>

                    <Modal
                        visible={toggleTime}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => {
                            setTempSelectedTime(selectedTime);
                            setToggleTime(false);
                        }}
                    >
                        <View className="flex-1 bg-black/50 justify-center items-center px-6">
                            <View className="bg-white rounded-[24px] p-6 w-full">
                                <View className={'flex flex-row w-full items-center justify-between mb-6'}>
                                    <IconSymbol name={'clock'} color={'#6B7280'} weight={'bold'} size={24} />
                                    <Text className={'text-black font-semibold text-xl'}>
                                        Select Time
                                    </Text>
                                    <TouchableOpacity onPress={() => {
                                        setTempSelectedTime(selectedTime);
                                        setToggleTime(false);
                                    }}>
                                        <IconSymbol name={'xmark'} color={'#6B7280'} weight={'bold'} size={24} />
                                    </TouchableOpacity>
                                </View>
                                <View className="rounded-[24px] flex flex-col items-center justify-center w-full">
                                    <TimerPicker
                                        key={`time-picker-${toggleTime}-${tempSelectedTime?.hours}-${tempSelectedTime?.minutes}`}
                                        hideSeconds={true}
                                        initialValue={{
                                            hours: tempSelectedTime?.hours ?? new Date().getHours(),
                                            minutes: tempSelectedTime?.minutes ?? new Date().getMinutes()
                                        }}
                                        onDurationChange={(time) => setTempSelectedTime({ hours: time.hours, minutes: time.minutes })}
                                        styles={{
                                            pickerContainer: {
                                                backgroundColor: 'white',
                                                paddingVertical: 8,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                paddingHorizontal: 16,
                                                width: '100%',
                                            },
                                            pickerItem: {
                                                fontSize: 24,
                                                fontFamily: 'Inter',
                                                fontWeight: '600',
                                                color: '#111827',
                                            },
                                            pickerLabel: {
                                                fontSize: 24,
                                                color: '#6b7280',
                                                marginBottom: 6,
                                                fontWeight: '500',
                                            },
                                        }}
                                        hourLabel="h"
                                        minuteLabel="m"
                                    />
                                    <View className={'flex flex-row w-full mb-6'}>
                                        <Text className={'w-1/2 text-right text-gray-500 font-medium px-8'}>hour</Text>
                                        <Text className={'w-1/2 text-left text-gray-500 font-medium px-8'}>min</Text>
                                    </View>
                                    <TouchableOpacity
                                        className={'bg-accent rounded-full p-4 items-center justify-center w-full'}
                                        onPress={() => {
                                            if (tempSelectedTime) {
                                                setSelectedTime(tempSelectedTime);
                                                setTimeError('')
                                            }
                                            setToggleTime(false);
                                        }}
                                    >
                                        <Text className={'font-semibold text-white text-lg'}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        visible={showNoBudgetCategoryModal}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowNoBudgetCategoryModal(false)}
                    >
                        <View className="flex-1 bg-black/50 justify-center items-center px-6">
                            <View className="bg-white rounded-[34px] p-6 w-full">
                                <Text className="text-xl text-center font-semibold mb-2">No budget category selected</Text>
                                <Text className="text-lg text-gray-600 mb-6 text-center px-10">You didn&#39;t choose a budget category. Do you want to proceed and create the transaction without assigning a category?</Text>
                                <View className="flex-col w-full justify-end gap-3">
                                    <TouchableOpacity
                                        className="px-4 py-4 rounded-full border-2 border-accent"
                                        onPress={() => setShowNoBudgetCategoryModal(false)}
                                    >
                                        <Text className="text-center text-accent text-xl">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="px-4 py-4 rounded-full bg-accent"
                                        onPress={() => {
                                            setShowNoBudgetCategoryModal(false);
                                            handleCreateTransaction(true);
                                        }}
                                    >
                                        <Text className="text-white text-xl text-center font-semibold">Proceed</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

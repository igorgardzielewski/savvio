import {
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Image,
    ImageSourcePropType,
    Modal,
    Switch,
    Keyboard,
    TouchableWithoutFeedback
} from "react-native";
import { Text } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, {useState, memo, useEffect} from "react";
import {IconSymbol} from "@/components/ui/icon-symbol";
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import {BudgetCategory} from "@/types";
import dayjs from 'dayjs';
import {CircularProgressBase} from "react-native-circular-progress-indicator";
import {LinearGradient} from "expo-linear-gradient";
import { TimerPicker } from "react-native-timer-picker";
import {useUserStore} from "@/store/userStore";


type Shop = {
    logo: ImageSourcePropType;
    name: string;
    category: string;
}

type ReceiptItemData = {
    id: number;
    name: string;
    quantity: string;
    unit: string;
    amount: string;
}

const units = ['pcs', 'kg', 'g', 'l', 'ml'];

// small sample shop list
const SHOP_LIST: Shop[] = [
    { name: 'Uber Eats', category: 'Fast Food', logo: require('@/assets/images/ubereats.png') },
    { name: 'Biedronka', category: 'Groceries', logo: require('@/assets/images/biedronka.png') },
    { name: 'Lidl', category: 'Groceries', logo: require('@/assets/images/lidl.jpeg') },
    { name: 'Bolt', category: 'Transport', logo: require('@/assets/images/bolt.jpeg') },
];

// eslint-disable-next-line react/display-name
const ItemRow = memo(({
                          item,
                          onUpdate,
                          onDelete
                      }: {
    item: ReceiptItemData;
    onUpdate: (id: number, field: keyof ReceiptItemData, value: string) => void;
    onDelete: (id: number) => void;
}) => {
    const [showUnitPicker, setShowUnitPicker] = useState(false);

    const formatAmount = (text: string) => {
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
        return normalized;
    };

    const normalizeQuantity = (text: string) => {
        let t = text.replace(/,/g, '.');
        t = t.replace(/[^0-9.]/g, '');
        const parts = t.split('.');
        if (parts.length > 1) {
            const integer = parts[0];
            let fraction = parts.slice(1).join('');
            if (fraction.length > 3) fraction = fraction.slice(0, 3);
            t = integer + '.' + fraction;
        }
        return t;
    };

    return (
        <View className="flex-col">
            <View className="flex-row justify-between items-center py-2">
                <TextInput
                    className="text-base text-black font-medium flex-1"
                    placeholder="Item name"
                    onChangeText={(text) => onUpdate(item.id, 'name', text)}
                    value={item.name}
                    style={{
                        fontFamily: 'Inter',
                        padding: 0,
                        margin: 0,
                        lineHeight: 18,
                        fontSize: 16,
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                    }}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                    keyboardType="default"
                    underlineColorAndroid="transparent"
                />

                {/* quantity + unit container */}
                <View className="flex-row items-center w-[28%] justify-center gap-2">
                    <TextInput
                        className="text-base text-black font-medium"
                        placeholder="0"
                        onChangeText={(text) => {
                            const normalized = normalizeQuantity(text);
                            onUpdate(item.id, 'quantity', normalized);
                        }}
                        value={item.quantity}
                        style={{
                            fontFamily: 'Inter',
                            padding: 0,
                            margin: 0,
                            lineHeight: 18,
                            fontSize: 16,
                            includeFontPadding: false,
                            textAlignVertical: 'center',
                            width: 56,
                            textAlign: 'right',
                        }}
                        autoCapitalize="none"
                        maxLength={7}
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                        underlineColorAndroid="transparent"
                    />
                    <TouchableOpacity
                        onPress={() => setShowUnitPicker(!showUnitPicker)}
                        className="px-2 py-0.5 bg-gray-100 rounded-md"
                        style={{ minWidth: 32, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text className="text-xs text-gray-600 font-medium">{item.unit}</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    className="text-base text-black font-medium w-[20%] text-right"
                    placeholder="0.00"
                    onChangeText={(text) => {
                        const formatted = formatAmount(text);
                        onUpdate(item.id, 'amount', formatted);
                    }}
                    value={item.amount}
                    style={{
                        fontFamily: 'Inter',
                        padding: 0,
                        margin: 0,
                        lineHeight: 18,
                        fontSize: 16,
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                    }}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                    underlineColorAndroid="transparent"
                />
                <TouchableOpacity onPress={() => onDelete(item.id)} className="ml-2">
                    <IconSymbol name="bin.xmark" size={20} weight="bold" color="#e37a9e" />
                </TouchableOpacity>
            </View>
            {showUnitPicker && (
                <View className="flex-row gap-2 mt-2 mb-1 pl-2">
                    {units.map((unit) => (
                        <TouchableOpacity
                            key={unit}
                            onPress={() => {
                                onUpdate(item.id, 'unit', unit);
                                setShowUnitPicker(false);
                            }}
                            className={`px-3 py-1.5 rounded-full ${item.unit === unit ? 'bg-accent' : 'bg-gray-100'}`}
                        >
                            <Text className={`text-sm font-medium ${item.unit === unit ? 'text-white' : 'text-heading'}`}>
                                {unit}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
});

export default function ManuallyAdd() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const defaultStyles = useDefaultStyles();

    const scannedData = params.scannedData ? JSON.parse(params.scannedData as string) : null;

    const [isReceipt, setIsReceipt] = useState(scannedData ? true : false);
    const [shopQuery, setShopQuery] = useState(scannedData?.shop?.name || '');
    const [selectedCategory,setSelectedCategory] = useState<BudgetCategory | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [toggleShop, setToggleShop] = useState(false);
    const [toggleTime, setToggleTime] = useState(false);
    const [selectedTime, setSelectedTime] = useState<{hours: number, minutes: number} | null>(
        scannedData?.time || null
    );
    const [tempSelectedTime, setTempSelectedTime] = useState<{hours: number, minutes: number} | null>(
        scannedData?.time || null
    );
    const [selectedShop, setSelectedShop] = useState<Shop | null>(scannedData?.shop || null);
    const [totalPrice, setTotalPrice] = useState(scannedData?.totalAmount || "0.00");
    const [receiptItems, setReceiptItems] = useState<ReceiptItemData[]>(
        scannedData?.items || []
    );
    const currentBudget = useUserStore(state => state.user?.currentBudget ?? null);
    const rawCategories = currentBudget?.budgetCategories;
    const budgetCategories = Array.isArray(rawCategories) ? rawCategories.filter(Boolean) : [];
    const [nextItemId, setNextItemId] = useState(
        scannedData?.items ? Math.max(...scannedData.items.map((i: ReceiptItemData) => i.id)) + 1 : 1
    );
    const [selected, setSelected] = useState<DateType>(scannedData?.date || undefined);

    useEffect(() => {
        if (scannedData) {
            console.log('Receipt scanned successfully!');
        }
    }, [scannedData]);

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
        const newItem: ReceiptItemData = {
            id: nextItemId,
            name: '',
            quantity: '',
            unit: 'pcs',
            amount: ''
        };
        setReceiptItems([...receiptItems, newItem]);
        setNextItemId(nextItemId + 1);
    };

    const updateReceiptItem = (id: number, field: keyof ReceiptItemData, value: string) => {
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

    const pad = (n: number) => n.toString().padStart(2, '0');

    const renderTimeLabel = (t: { hours: number; minutes: number } | null) =>
        t ? `${pad(t.hours)}:${pad(t.minutes)}` : 'Time';

    const formatDate = (date: DateType) => {
        if (!date) return 'Select date';
        // @ts-ignore
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const filteredShops = SHOP_LIST.filter(s => s.name.toLowerCase().includes(shopQuery.toLowerCase()));

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
                        style={{ flex: 1, gap:24 }}
                    >
                        <SafeAreaView className="flex-1" edges={['top']}>
                            {/* Main container */}
                            <View className="flex-1 justify-between">
                                {/* Top section */}
                                <View className={'flex flex-row justify-between items-center px-6'}>
                                    <TouchableOpacity className={'bg-white p-4 rounded-full'} onPress={() => router.back()}>
                                        <IconSymbol name="arrow.left" size={24} weight={'bold'} color="#6b5aed" />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ justifyContent: "center",paddingHorizontal: 16, gap: 24, marginTop:24, paddingBottom: 50 }}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingHorizontal: -8, alignItems: 'center',gap: 8}}
                                    >
                                        {budgetCategories.map((category) => {
                                            const percentageSpent =
                                                category.allocated > 0 ? Math.min(100, (category.spent / category.allocated) * 100) : 0;

                                            return (
                                                <TouchableOpacity key={category.id} className={' rounded-full items-center p-2 justify-center '} style={{backgroundColor: selectedCategory?.id === category.id ? category.color : 'white' }} onPress={() => {setSelectedCategory(category)}}>
                                                    <CircularProgressBase
                                                        value={percentageSpent}
                                                        radius={28}
                                                        activeStrokeWidth={4}
                                                        inActiveStrokeWidth={4}
                                                        maxValue={100}
                                                        activeStrokeColor={selectedCategory?.id === category.id ? 'white' : category.color}
                                                        circleBackgroundColor={selectedCategory?.id === category.id ? category.color : 'white'}
                                                        inActiveStrokeColor={selectedCategory?.id === category.id ? '#ffffff90' : category.color+'30'}
                                                        strokeLinecap="butt"
                                                        rotation={0}
                                                        clockwise={false}
                                                    >
                                                        <View style={{ alignItems: 'center' }}>
                                                            <IconSymbol name={category.iconUri} color={selectedCategory?.id === category.id ? 'white' : category.color} weight="bold" size={24} />
                                                        </View>
                                                    </CircularProgressBase>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                    <View className={`bg-white ${isCalendarOpen ? 'rounded-[34px]' : 'rounded-[24px]'} shadow-sm`}>
                                        {isCalendarOpen
                                            ? (
                                                <DateTimePicker
                                                    mode="single"
                                                    className={'bg-white rounded-[34px] p-4'}
                                                    navigationPosition={'right'}
                                                    date={selected}
                                                    maxDate={new Date()}
                                                    onChange={({ date }) => {
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
                                                <TouchableOpacity className="flex flex-row w-full items-center p-6" onPress={() => setIsCalendarOpen(true)}>
                                                    <View className={'flex flex-row items-center justify-between w-full'}>
                                                        <IconSymbol name={'calendar'} color={'#6B7280'} weight={'bold'} size={24} />
                                                        <Text className={`${selected ? 'text-black' : 'text-heading'} font-medium text-lg`}>
                                                            {selected ? dayjs(selected).format('DD MMMM YYYY') : 'Select date'}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                    </View>
                                    <View className={'w-full flex flex-row gap-4 items-start'}>
                                        <View className={'flex-1 p-6 w-full bg-white rounded-[24px] flex flex-col items-center shadow-sm gap-6'}>
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
                                                            onFocus={() => setToggleShop(true)}
                                                        />
                                                    </View>
                                                    <View className={'rounded-b-[24px] flex flex-col items-start gap-4 mt-2 w-full'}>
                                                        <ScrollView style={{ maxHeight: 180,width:'100%' }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0 }} >
                                                            {filteredShops.map((shop, index) => (
                                                                <React.Fragment key={index}>
                                                                    {index>0 && <View className="h-[1px] w-full bg-black/10" />}
                                                                    <TouchableOpacity
                                                                        className="w-full flex-row items-center justify-between py-3"
                                                                        activeOpacity={0.7}
                                                                        onPress={() => {selectShop(shop)}}
                                                                    >
                                                                        <View className="flex-row items-center gap-3">
                                                                            <Image
                                                                                source={(shop.logo)}
                                                                                className="w-10 h-10 rounded-[12px]"
                                                                            />
                                                                            <View>
                                                                                <Text className="text-black font-semibold">{shop.name}</Text>
                                                                                <Text className="text-black/50 text-xs">{shop.category}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                </React.Fragment>
                                                            ))}

                                                            {filteredShops.length === 0 && (
                                                                <View className="py-4 px-2">
                                                                    <Text className="text-sm text-gray-500">No shops found</Text>
                                                                </View>
                                                            )}
                                                        </ScrollView>
                                                    </View>
                                                </View>
                                            ) : selectedShop ? (
                                                <TouchableOpacity className={'flex flex-row w-full -my-2 items-center justify-start gap-3'} onPress={() => setToggleShop(true)}>
                                                    <Image
                                                        source={(selectedShop.logo)}
                                                        className="w-11 h-11 rounded-[12px]"
                                                    />
                                                    <Text className={`text-black font-medium text-lg`}>{selectedShop.name}</Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity className={'flex flex-row w-full justify-between'} onPress={() => setToggleShop(true)}>
                                                    <IconSymbol name={'cart'} color={'#6B7280'} weight={'bold'} size={24} />
                                                    <Text className={`${selected ? 'text-black' : 'text-heading'} font-medium text-lg`}>
                                                        &nbsp;Select shop
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <TouchableOpacity
                                            className={'flex-1 p-6 bg-white rounded-[24px] shadow-sm flex flex-row items-center justify-between'}
                                            onPress={() => setToggleTime(true)}
                                        >
                                            <IconSymbol name={'clock'} color={'#6B7280'} weight={'bold'} size={24} />
                                            <Text className={`${selectedTime ? 'text-black' : 'text-heading'} font-medium text-lg`}>
                                                &nbsp;{renderTimeLabel(selectedTime)}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View className={'bg-white p-6 rounded-[24px] shadow-sm gap-6 flex-col flex'}>
                                        <View className={'flex flex-row items-center justify-between'}>
                                            <View className={'flex flex-col'}>
                                                <Text className={'font-medium text-heading text-lg'}>Add a receipt</Text>
                                                <Text className={'text-headingMeta text-sm'}>Have receipt? Add positions manually.</Text>
                                            </View>
                                            <Switch
                                                trackColor={{ false: "#d1d5db", true: "#6b5aed" }}
                                                thumbColor={isReceipt ? "#ffffff" : "#f4f3f4"}
                                                ios_backgroundColor="#d1d5db"
                                                onValueChange={setIsReceipt}
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
                                        <View className={'bg-white p-6 rounded-[24px] shadow-sm gap-6'}>
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
                                                                source={selectedShop.logo}
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
                                                            <ItemRow
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
                                        <TouchableOpacity className="bg-accent rounded-full p-6 items-center justify-center">
                                            <Text className="text-white font-semibold">Add expense</Text>
                                        </TouchableOpacity>
                                    </SafeAreaView>
                                </View>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>

                    {/* Time Picker Modal */}
                    <Modal
                        visible={toggleTime}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setToggleTime(false)}
                    >
                        <View className="flex-1 bg-black/50 justify-center items-center px-6">
                            <View className="bg-white rounded-[24px] p-6 w-full">
                                <View className={'flex flex-row w-full items-center justify-between mb-6'}>
                                    <IconSymbol name={'clock'} color={'#6B7280'} weight={'bold'} size={24} />
                                    <Text className={'text-black font-semibold text-xl'}>
                                        Select Time
                                    </Text>
                                    <TouchableOpacity onPress={() => setToggleTime(false)}>
                                        <IconSymbol name={'xmark'} color={'#6B7280'} weight={'bold'} size={24} />
                                    </TouchableOpacity>
                                </View>
                                <View className="rounded-[24px] flex flex-col items-center justify-center w-full">
                                    <TimerPicker
                                        hideSeconds={true}
                                        initialValue={{hours:selectedTime?.hours,minutes:selectedTime?.minutes}}
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
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

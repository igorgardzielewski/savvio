import { Text } from '@/components/ui/Text';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { debounce } from '@/helpers/helpers';
import { getLogoSource } from "@/helpers/imageHelpers";
import { useAuthStore } from "@/store/authStore";
import { Period, Shop, Subscription, Transaction } from "@/types";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator, KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Switch,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

interface AddSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    addSubscription?: (subscription: Subscription) => void;
    addTransaction?: (transaction: Transaction) => void;
}

const AnimatedShopItem = ({ shop, index, onSelect }: { shop: Shop; index: number; onSelect: (shop: Shop) => void }) => {
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(-20);

    useEffect(() => {
        const staggerDelay = index * 50;
        opacity.value = withDelay(staggerDelay, withTiming(1, { duration: 300, easing: Easing.ease }));
        translateX.value = withDelay(staggerDelay, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }));
    }, [index, opacity, translateX]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            {index > 0 && <View className="h-[1px] w-full bg-black/10" />}
            <TouchableOpacity
                className="w-full flex-row items-center justify-between py-3"
                activeOpacity={0.7}
                onPress={() => onSelect(shop)}
            >
                <View className="flex-row items-center justify-center gap-3">
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
                        <Image
                            source={getLogoSource(shop.logoUrl)}
                            style={{ width: 40, height: 40 }}
                            contentFit="cover"
                            transition={200}
                        />
                    </View>
                    <View>
                        <Text className="text-black font-semibold">{shop.name}</Text>
                        <Text className="text-black/50 text-xs">{shop.categoryName}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const AddSubscriptionModal = ({ visible, onClose, addSubscription, addTransaction }: AddSubscriptionModalProps) => {
    const [shopSearchQuery, setShopSearchQuery] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<Period>();
    const [searchedShops, setSearchedShops] = useState<Shop[]>([]);
    const [searchedShopsLoading, setSearchedShopsLoading] = useState<boolean>(false);
    const [selectedShop, setSelectedShop] = React.useState<Shop | null>(null);
    const { token } = useAuthStore();
    const [price, setPrice] = React.useState<string>('00.00');
    const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4>(1);
    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
    const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(true);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [shopError, setShopError] = useState<boolean>(false);
    const [periodError, setPeriodError] = useState<boolean>(false);
    const [dateError, setDateError] = useState<boolean>(false);
    const fetchAddSubscription = async () => {
        setLoading(true);
        try {
            const body = {
                shopId: selectedShop?.id,
                color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                period: selectedPeriod,
                price: parseFloat(price),
                nextPayment: selectedDate.toISOString(),
                shouldNotify: notificationsEnabled
            }
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/subscriptions/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            console.log(response);
            const data = await response.json() as Subscription;
            if (response.ok) {
                if (addSubscription) {
                    addSubscription(data);
                }
                if (addTransaction && data.transactions && data.transactions.length > 0) {
                    data.transactions.forEach((transaction) => {
                        addTransaction(transaction);
                    });
                }
                if (notificationsEnabled) {
                    const { scheduleSubscriptionNotifications } = await import('@/helpers/notificationHelpers');
                    await scheduleSubscriptionNotifications({ ...data, shouldNotify: true });
                }

                onClose();
            }
        }
        catch (error) {
            console.error('Error adding subscription:', error);
        }
        finally {
            setLoading(false);
        }
    }
    React.useEffect(() => {
        if (selectedShop) setShopError(false);
    }, [selectedShop]);

    React.useEffect(() => {
        if (selectedPeriod) setPeriodError(false);
    }, [selectedPeriod]);

    const validateStep1 = (): boolean => {
        let isValid = true;
        if (!selectedShop) {
            setShopError(true);
            isValid = false;
        }
        if (!selectedPeriod) {
            setPeriodError(true);
            isValid = false;
        }
        return isValid;
    };

    const validateStep2 = (): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);

        if (selected < today) {
            setDateError(true);
            setSelectedDate(new Date());
            return false;
        }
        setDateError(false);
        return true;
    };

    const handleContinue = async () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;

        if (addSubscription) {
            if (currentStep < 4) {
                if (currentStep === 1 && selectedPeriod === 'ONE_TIME') {
                    setCurrentStep(3);
                } else {
                    setCurrentStep((step) => (step + 1) as 1 | 2 | 3 | 4);
                }
            } else {
                await fetchAddSubscription();
                //clear state
                setSelectedShop(null);
                setSelectedPeriod(undefined);
                setPrice('00.00');
                setCurrentStep(1);
                setSelectedDate(new Date());
                setNotificationsEnabled(true);
                setShopSearchQuery('');
                setSearchedShops([]);
                onClose();
            }
        }
    };
    const searchByShopQuery = React.useCallback(async (query: string) => {
        try {
            setSearchedShopsLoading(true);
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/shops/search?query=${query.trim()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })
            if (!res.ok) {
                console.log('Failed to fetch shops');
                return;
            }
            const data = await res.json();
            setSearchedShops(data);
        }
        catch (err) {
            console.log('Failed to fetch shops', err);
        }
        finally {
            setSearchedShopsLoading(false);
        }
    }, [token]);
    const debouncedSearch = React.useRef(
        debounce((query: string) => {
            searchByShopQuery(query);
        }, 500)
    ).current;

    React.useEffect(() => {
        if (shopSearchQuery.trim().length > 0) {
            debouncedSearch(shopSearchQuery);
        } else {
            setSearchedShops([]);
        }
    }, [shopSearchQuery, debouncedSearch]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 justify-end pb-safe">
                    <TouchableWithoutFeedback onPress={onClose}>
                        <View
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
                        />
                    </TouchableWithoutFeedback>

                    <View
                        className="bg-white rounded-[40px] p-6 m-2"
                        style={{ maxHeight: '85%' }}
                    >
                        <View className="items-start ">
                            <Text className="text-2xl text-left font-bold mb-6">
                                {currentStep === 1 && 'Choose Shop & Plan'}
                                {currentStep === 2 && 'Set next payment date'}
                                {currentStep === 3 && 'Put price'}
                                {currentStep === 4 && 'Summary'}
                            </Text>
                        </View>
                        {currentStep === 1 && (
                            <>
                                <View className={'relative'}>
                                    {selectedShop ? (
                                        <TouchableOpacity
                                            className="flex flex-row border border-accent bg-accent/10 rounded-full px-6 py-3 mb-4 items-center justify-between"
                                            onPress={() => setSelectedShop(null)}
                                            activeOpacity={0.7}
                                        >
                                            <View className="flex-row items-center gap-3">
                                                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
                                                    <Image
                                                        source={getLogoSource(selectedShop.logoUrl)}
                                                        style={{ width: 40, height: 40 }}
                                                        contentFit="cover"
                                                        transition={200}
                                                    />
                                                </View>
                                                <View>
                                                    <Text className="text-black font-semibold">{selectedShop.name}</Text>
                                                    <Text className="text-black/50 text-xs">{selectedShop.categoryName}</Text>
                                                </View>
                                            </View>
                                            <IconSymbol name={'xmark.circle.fill'} color={'#6b5aed'} size={24} />
                                        </TouchableOpacity>
                                    ) : (
                                        <>
                                            <View className={`flex flex-row border ${shopError ? 'border-red-500' : 'border-gray-300'} rounded-full px-6 mb-2 items-center`}>
                                                <IconSymbol name={'cart'} color={shopError ? '#ef4444' : 'black'} size={24} />
                                                <TextInput
                                                    className="w-full h-16 ml-4"
                                                    placeholderClassName={'items-center'}
                                                    placeholder={'Type shop name...'}
                                                    value={shopSearchQuery}
                                                    onChangeText={setShopSearchQuery}
                                                />
                                            </View>
                                            {shopError && (
                                                <Text className="text-red-500 text-sm mb-2 ml-2">Please select a shop to continue</Text>
                                            )}
                                        </>
                                    )}
                                    {!selectedShop && shopSearchQuery.length > 0 && (
                                        <View className={'absolute top-[100%] left-0 right-0 bg-white border border-gray-300 p-4 rounded-3xl'} style={{ zIndex: 9999 }}>
                                            {shopSearchQuery.length <= 0 && <View className={'min-h-16 items-center justify-center'}>
                                                <Text className={'text-gray-500'}>Start typing to search shop</Text>
                                            </View>}
                                            {searchedShopsLoading && shopSearchQuery.length > 0 && <ActivityIndicator size="large" color="#6b5aed" />}
                                            {!searchedShopsLoading &&
                                                <ScrollView className={'max-h-[150px]'}>
                                                    {searchedShops.map((shop, index) => (
                                                        <AnimatedShopItem
                                                            key={shop.id || index}
                                                            shop={shop}
                                                            index={index}
                                                            onSelect={setSelectedShop}
                                                        />
                                                    ))}
                                                </ScrollView>
                                            }
                                            {!searchedShopsLoading && shopSearchQuery.length > 0 && searchedShops.length === 0 && (
                                                <View className={'min-h-16 items-center justify-center'}>
                                                    <Text className={'text-gray-500'}>No shops found</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                                <View className={'flex flex-col gap-2 items-center justify-center mb-4 mt-4'}>
                                    <View className={'flex flex-row gap-4 items-center'}>
                                        <TouchableOpacity className={`${selectedPeriod === 'MONTHLY' ? 'bg-accent' : 'bg-gray-200'} ${periodError && !selectedPeriod ? 'border-2 border-red-500' : ''} py-4 px-6 rounded-full`} onPress={() => setSelectedPeriod('MONTHLY')}>
                                            <Text className={`font-medium ${selectedPeriod === 'MONTHLY' ? 'text-white font-semibold' : 'text-black font-medium'}`}>Monthly</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className={`${selectedPeriod === 'YEARLY' ? 'bg-accent' : 'bg-gray-200'} ${periodError && !selectedPeriod ? 'border-2 border-red-500' : ''} py-4 px-6 rounded-full`}
                                            onPress={() => setSelectedPeriod('YEARLY')}>
                                            <Text className={`${selectedPeriod === 'YEARLY' ? 'text-white font-semibold' : 'text-black font-medium '}`}>Yearly</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        className={`${selectedPeriod === 'ONE_TIME' ? 'bg-accent' : 'bg-gray-200'} ${periodError && !selectedPeriod ? 'border-2 border-red-500' : ''} py-4 px-6 rounded-full`}
                                        onPress={() => setSelectedPeriod('ONE_TIME')}>
                                        <Text className={`${selectedPeriod === 'ONE_TIME' ? 'text-white font-semibold' : 'text-black font-medium '}`}>One Time</Text>
                                    </TouchableOpacity>
                                    {periodError && (
                                        <Text className="text-red-500 text-sm mt-1">Please select a billing period</Text>
                                    )}
                                </View>
                            </>
                        )}
                        {currentStep === 2 && (
                            <>
                                <View className={'items-center justify-center relative w-full'}>
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display="spinner"
                                        minimumDate={new Date()}
                                        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 100))}
                                        onChange={(event, date) => {
                                            if (date) {
                                                setSelectedDate(date);
                                                setDateError(false);
                                            }
                                        }}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <View className={'absolute top-[42%] w-[87%] py-5 bg-accent/40 rounded-lg'} />
                                    )}
                                </View>
                                {dateError && (
                                    <Text className="text-red-500 text-sm text-center mb-2">Date cannot be in the past.</Text>
                                )}
                            </>
                        )}
                        {currentStep === 3 && (
                            <View className={'items-center justify-center w-full gap-2 mb-8'}>
                                <View className={'flex flex-row items-center justify-between mb-4 w-full px-4'}>
                                    <TouchableOpacity
                                        className={'p-2 border bg-white border-gray-300 rounded-full'}
                                        onPress={() => {
                                            const currentPrice = parseFloat(price) || 0;
                                            const newPrice = Math.max(0, currentPrice - 1);
                                            setPrice(newPrice.toFixed(2));
                                        }}
                                    >
                                        <IconSymbol name={'minus'} color={'#6b5aed'} size={28} weight={'semibold'} />
                                    </TouchableOpacity>
                                    <View className={'flex-1 items-center justify-center mx-4'}>
                                        <TextInput
                                            className={'text-accent font-semibold text-[54px] text-center w-full'}
                                            value={price}
                                            onChangeText={(text) => {
                                                const normalized = text.replace(',', '.');
                                                const cleaned = normalized.replace(/[^0-9.]/g, '');
                                                const parts = cleaned.split('.');
                                                if (parts.length > 2) return;
                                                if (parts[1] && parts[1].length > 2) return;
                                                setPrice(cleaned);
                                            }}
                                            keyboardType="decimal-pad"
                                            placeholder="00.00"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        className={'p-2 border bg-white border-gray-300 rounded-full'}
                                        onPress={() => {
                                            const currentPrice = parseFloat(price) || 0;
                                            const newPrice = currentPrice + 1;
                                            setPrice(newPrice.toFixed(2));
                                        }}
                                    >
                                        <IconSymbol name={'plus'} color={'#6b5aed'} size={28} weight={'semibold'} />
                                    </TouchableOpacity>
                                </View>
                                <Text className={'items-center justify-center text-gray-500'}>
                                    The subscription price is <Text className={'font-semibold'}>{price || '00.00'} zł.</Text>
                                </Text>
                            </View>
                        )}
                        {currentStep === 4 && (
                            <View className={'w-full gap-6 mb-4'}>
                                <View className="flex flex-row border border-accent bg-accent/10 rounded-[32px] px-6 py-4 items-center gap-4">
                                    <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'white', overflow: 'hidden' }}>
                                        <Image
                                            source={getLogoSource(selectedShop?.logoUrl || '')}
                                            style={{ width: 56, height: 56 }}
                                            contentFit="cover"
                                            transition={200}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-black font-bold text-xl">{selectedShop?.name}</Text>
                                        <Text className="text-black/50 text-base">{selectedShop?.categoryName}</Text>
                                    </View>
                                </View>
                                <View className="flex-row gap-4">
                                    <View className="flex-1 border border-gray-300 rounded-3xl p-4 items-center justify-center gap-2">
                                        <Text className="text-gray-400 text-xs uppercase font-bold tracking-wider">Price</Text>
                                        <Text className="text-black font-semibold text-2xl text-center">{price} zł<Text className={'text-xs font-medium'}>{selectedPeriod === 'YEARLY' ? '/year' : ''}</Text></Text>
                                    </View>
                                    <View className="flex-1 border border-gray-300 rounded-3xl p-4 items-center justify-center gap-2">
                                        <Text className="text-gray-400 text-xs uppercase font-bold tracking-wider">Next Payment</Text>
                                        <Text className="text-black text-2xl font-semibold">
                                            {selectedDate.toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between px-2 border border-gray-300 rounded-3xl p-4 gap-2">
                                    <View className="flex-row items-center gap-3">
                                        <View className="p-3 rounded-full">
                                            <IconSymbol name={'bell.fill'} color={'#6b5aed'} size={24} />
                                        </View>
                                        <View>
                                            <Text className="font-semibold text-xl text-black">Reminders</Text>
                                            <Text className="text-gray-400 text-sm max-w-[20vh]">Get notified 3 days, 1 day and 1 hour before payment day</Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={notificationsEnabled}
                                        onValueChange={setNotificationsEnabled}
                                        trackColor={{ false: '#e5e7eb', true: '#6b5aed' }}
                                        thumbColor={'white'}
                                        ios_backgroundColor="#e5e7eb"
                                    />
                                </View>
                            </View>
                        )}
                        <View className="items-end gap-2">
                            {currentStep > 1 && (
                                <TouchableOpacity onPress={() => {
                                    if (currentStep === 3 && selectedPeriod === 'ONE_TIME') {
                                        setCurrentStep(1);
                                    } else {
                                        setCurrentStep((step) => (step - 1) as 1 | 2 | 3 | 4);
                                    }
                                }} className={'bg-white border border-accent py-2 px-6 rounded-full'}>
                                    <View className={'flex flex-row items-center justify-between'}>
                                        <IconSymbol name={'arrow.left'} color={'#6b5aed'} size={20} weight={'bold'} />
                                        <Text className={'text-accent font-semibold py-2 text-lg ml-2'}>Back</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={handleContinue}
                                className={'bg-accent py-2 px-6 rounded-full'}>
                                <View className={'flex flex-row items-center justify-between'}>
                                    <Text className={'text-white font-semibold py-2 text-lg mr-2'}>{currentStep === 4 ? 'Confirm' : 'Continue'}</Text>
                                    <IconSymbol name={currentStep === 4 ? 'checkmark' : 'arrow.right'} color={'white'} size={20} weight={'bold'} />
                                </View>
                            </TouchableOpacity>

                        </View>

                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

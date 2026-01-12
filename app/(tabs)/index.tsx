import { IconSymbol } from '@/components/ui/icon-symbol';
import LastTransactionModal from "@/components/ui/LastTransactionModal";
import { Text } from '@/components/ui/Text';
import { getLogoSource } from "@/helpers/imageHelpers";
import { getInitials } from "@/helpers/stringHelpers";
import { formatDate, formatMonthYear, formatTime } from "@/helpers/timeHelper";
import { sortReceipts } from "@/helpers/transactionHelpers";
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from "@/store/userStore";
import { Subscription, Transaction } from "@/types";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { SFSymbols6_0 } from "sf-symbols-typescript";
const styles = StyleSheet.create({
    heading: { color: '#414054', fontSize: 18, fontWeight: '600' },
    headingMeta: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
    amount: { color: '#F87171', fontSize: 36, fontWeight: '700' },
    amountMeta: { color: '#374151', fontSize: 16, fontWeight: '600' },
    accent: { color: '#6B5AED' },
    gradient: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 100,
        gap: 24,
        // optional: borderRadius: 20,
    },
});
export const familyUsersColors = [
    { background: '#e0e7ff', border: '#6b5aed' },
    { background: '#dcfce7', border: '#22c55e' },
    { background: '#fef3c7', border: '#f59e0b' },
    { background: '#fce7f3', border: '#ec4899' },
    { background: '#cffafe', border: '#06b6d4' },
    { background: '#fee2e2', border: '#ef4444' },
];
export default function App() {
    const router = useRouter();
    const currentBudget = useUserStore(state => state.user?.currentBudget ?? null);
    const rawLastTransactions = useUserStore(state => state.user?.lastTransactions);
    const user = useUserStore(state => state.user);
    const lastTransactions: Transaction[] = useMemo(
        () => sortReceipts(rawLastTransactions ?? [], 'date', 'desc'),
        [rawLastTransactions]
    );
    const { updateFamily } = useUserStore();
    const rawCategories = currentBudget?.budgetCategories;
    const budgetCategories = Array.isArray(rawCategories) ? rawCategories.filter(Boolean) : [];
    const rawSubscriptions = useUserStore(state => state.user?.subscriptions);
    const subscriptions = useMemo(() => rawSubscriptions ?? [], [rawSubscriptions]);
    const [lastTransactionModalVisible, setLastTransactionModalVisible] = useState(false);
    const [inputCode, setInputCode] = useState('');
    const codeInputRefs = useRef<(TextInput | null)[]>([]);
    const [familyStep, setFamilyStep] = useState<'lock' | 'menu' | 'enterCode' | 'shareLevel'>('lock');
    const [familyAction, setFamilyAction] = useState<'join' | 'create'>('join');
    const [shareLevel, setShareLevel] = useState<'NONE' | 'SUMMARY' | 'ALL'>('NONE');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);
    const { token } = useAuthStore();
    const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
    const goals = useMemo(() => user?.goals ?? [], [user?.goals]);
    const [refreshing, setRefreshing] = useState(false);
    const { setUser } = useUserStore();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (error) {
            console.error('Failed to refresh:', error);
        } finally {
            setRefreshing(false);
        }
    }, [token, setUser]);
    const handleCreateFamily = async () => {
        if (!user?.premium || user?.family) return;
        setCreateError(null);
        setCreateLoading(true);
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/family`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    shareLevel: shareLevel,
                })
            })
            if (res.ok) {
                const data = await res.json();
                updateFamily(data);
                router.push('/(family)/familyPage');
            }
            else {
                setCreateError('Error creating family. Please try again.');
            }
        } catch (error) {
            console.log(error);
        } finally {
            setCreateLoading(false);
        }
    }

    const handleJoinFamily = async () => {
        if (inputCode.length !== 6) return;
        setJoinError(null);
        setJoinLoading(true);
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/family/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    inviteCode: inputCode,
                    shareLevel: shareLevel,
                })
            });
            if (res.ok) {
                const data = await res.json();
                updateFamily(data);
                router.push('/(family)/familyPage');
            } else {
                const errorData = await res.json().catch(() => null);
                setJoinError(errorData?.message || 'Error joining family. Please try again.');
            }
        } catch (error) {
            console.log(error);
            setJoinError('Error joining family. Please try again.');
        } finally {
            setJoinLoading(false);
        }
    }
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const chartData = useMemo(() => {
        const today = new Date();
        const currentDay = today.getDay();
        const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        const startOfWeek = new Date(today.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weekData = Array(7).fill(0).map((_, i) => ({
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
            amount: 0,
            height: 0
        }));

        lastTransactions.forEach(transaction => {
            const tDate = new Date(transaction.date);
            if (tDate >= startOfWeek && tDate <= endOfWeek) {
                const dayIndex = tDate.getDay() === 0 ? 6 : tDate.getDay() - 1;
                weekData[dayIndex].amount += transaction.amount;
            }
        });

        const maxAmount = Math.max(...weekData.map(d => d.amount));
        weekData.forEach(d => {
            d.height = maxAmount > 0 ? d.amount / maxAmount : 0;
            if (d.amount > 0 && d.height < 0.1) d.height = 0.1;
        });

        return weekData;
    }, [lastTransactions]);
    useEffect(() => {
        Animated.stagger(50, [
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim]);
    useEffect(() => {
        if (user?.premium)
            setFamilyStep('menu');
    }, [user?.premium]);

    useEffect(() => {
        if (goals.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentGoalIndex((prev) => (prev + 1) % goals.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [goals.length]);

    const MAX_BAR_HEIGHT = 120;
    return (
        <ScrollView
            className="flex-1 "
            contentContainerStyle={{
                backgroundColor: '#f2f0ff',
                gap: 24,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#6b5aed"
                    colors={['#6b5aed']}
                />
            }
        >
            <LinearGradient
                colors={['#f2f0ff', '#e2deff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.4 }}
                style={styles.gradient}
            >

                <View className={'gap-0'}>
                    <View className="flex flex-row items-center justify-between">
                        <Text className="text-[#120f29] text-xl font-medium" style={styles.heading}>Your current budget</Text>
                    </View>

                    <View className="flex-row items-baseline">
                        <Text className="text-danger text-[50px] font-bold">{currentBudget?.spent ? currentBudget.spent.toFixed(2) : 0}</Text>
                        <Text className="text-lg font-bold" style={styles.amountMeta}>&nbsp;z {currentBudget?.budgetLimit ?? 0} zł
                        </Text>
                    </View>
                    <View className="w-full flex flex-row items-start gap-3 mt-2 pr-14">
                        <TouchableOpacity className="rounded-full flex-1 py-4 px-2 items-center flex flex-row gap-2 justify-center bg-[#6b5aed]" onPress={() => router.push('/(addexpense)/ManuallyAdd')}>
                            <Text className={'font-medium text-white text-2xl'}>Add</Text>
                            <IconSymbol name="plus" color="white" weight={'bold'} size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity className="rounded-full flex-1 py-4 px-2 items-center flex flex-row gap-2 justify-center bg-white" onPress={() => router.push('/(addexpense)/ScanReceipt')}>
                            <Text className={'font-medium text-[#6b5aed] text-2xl'}>Scan</Text>
                            <IconSymbol name="camera" color="#6b5aed" weight={'bold'} size={24} />
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: -8, alignItems: 'center', gap: 8 }}
                >
                    {budgetCategories.map((category) => {
                        if (!category) return null;
                        const allocated = category.allocated ?? 0;
                        const spent = category.spent ?? 0;
                        const percentageSpent = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
                        return (
                            <View key={category.id} className={'bg-white rounded-full items-center p-2 justify-center '}>
                                <CircularProgressBase
                                    value={percentageSpent}
                                    radius={28}
                                    activeStrokeWidth={4}
                                    inActiveStrokeWidth={4}
                                    maxValue={100}
                                    activeStrokeColor={category.color || '#6b5aed'}
                                    circleBackgroundColor={'white'}
                                    inActiveStrokeColor={(category.color || '#6b5aed') + '30'}
                                    strokeLinecap="butt"
                                    rotation={0}
                                    clockwise={false}
                                >
                                    <View style={{ alignItems: 'center' }}>
                                        <IconSymbol name={category.iconUri as SFSymbols6_0} color={category.color || '#6b5aed'} weight="bold" size={24} />
                                    </View>
                                </CircularProgressBase>
                            </View>
                        );
                    })}
                    <TouchableOpacity className={'bg-white rounded-full items-center p-2 justify-center'} key="add" onPress={() => router.push('/(tabs)/budget')} activeOpacity={0.6}>
                        <CircularProgressBase
                            value={0}
                            radius={28}
                            activeStrokeWidth={4}
                            inActiveStrokeWidth={4}
                            maxValue={100}
                            activeStrokeColor={'white'}
                            circleBackgroundColor={'white'}
                            inActiveStrokeColor={'white'}
                            strokeLinecap="butt"
                            rotation={0}
                            clockwise={false}
                        >
                            <View style={{ alignItems: 'center' }} >
                                <IconSymbol name={'plus'} color={'#6b5aed'} weight="bold" size={24} />
                            </View>
                        </CircularProgressBase>
                    </TouchableOpacity>
                </ScrollView>
                {/*</View>*/}
                <View className="rounded-[24px] bg-white p-4 min-h-[100px]">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold" style={styles.heading}>Recent Activity</Text>
                    </View>
                    {lastTransactions.length === 0 ? (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-black/50 text-lg font-medium py-4">No recent transactions</Text>
                        </View>
                    ) :
                        lastTransactions.map((transaction, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <View className="h-[1px] bg-black/5 w-full my-3" />}
                                <TouchableOpacity
                                    className="flex-row items-center justify-between"
                                    onPress={() => router.push('/(tabs)/explore')}
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-row items-center gap-3">
                                        <Image
                                            source={getLogoSource(transaction.shop.logoUrl)}
                                            className="w-12 h-12 rounded-[12px]"
                                        />
                                        <View>
                                            <Text className="text-black font-semibold">{transaction.shop.name}</Text>
                                            <Text className="text-black/50 text-xs">{transaction.shop.categoryName}</Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="font-bold text-[#f87171]">{transaction.amount.toFixed(2)} zł</Text>
                                        <Text className="text-black/50 text-xs">{formatDate(transaction.date)}&nbsp;{formatTime(transaction.time)}</Text>
                                    </View>
                                </TouchableOpacity>
                            </React.Fragment>
                        ))}
                </View>

                {/* CONTENT GRID */}
                <View style={{ height: 280 }} className="flex flex-row gap-4 ">
                    {/* LEFT - AI Assistant */}
                    <View className="flex-1 ">
                        <TouchableOpacity
                            onPress={() => user?.aiTutorialWatched ? router.push('/(aiassistant)/AiMain') : router.push('/(aiassistant)/howitworks')}
                            activeOpacity={0.9}
                            className="flex-1"
                        >
                            <View className="rounded-[34px] p-4 flex-1 justify-between items-start bg-white gap-2 border border-black/5">
                                <View className={'flex flex-row items-center gap-2'}>
                                    <Text className="text-black text-lg font-bold" style={styles.heading}>AI Assistant</Text>
                                </View>

                                <Image
                                    source={require('@/assets/images/aibuddy4.png')}
                                    className="w-32 h-32 object-contain rotate-[-15deg] overflow-hidden self-center"
                                />
                                <Text className="text-gray-500 text-md font-bold">
                                    Ask Savvio about your savings
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* RIGHT SIDE */}
                    <View className="flex flex-col flex-1 gap-4">
                        <TouchableOpacity
                            style={{ padding: 12 }}
                            className="rounded-[28px] p-5 flex-1 justify-between bg-white border border-black/5"
                            activeOpacity={0.8}
                            onPress={() => router.push('/(goals)')}
                        >
                            {goals.length > 0 ? (
                                <View className="flex flex-col justify-between flex-1">
                                    <View className="flex flex-row items-center gap-2 mb-3">
                                        <View
                                            style={{ backgroundColor: goals[currentGoalIndex].color + '20' }}
                                            className="w-8 h-8 rounded-full items-center justify-center"
                                        >
                                            <IconSymbol
                                                name={goals[currentGoalIndex].icon_sf_symbol as any}
                                                size={16}
                                                color={goals[currentGoalIndex].color}
                                            />
                                        </View>
                                        <Text className="text-black text-base font-semibold flex-1" numberOfLines={1} style={styles.heading}>
                                            {goals[currentGoalIndex].name}
                                        </Text>
                                    </View>

                                    <View className="flex flex-col flex-1 justify-end">
                                        <View className="relative mb-2">
                                            <View
                                                style={{
                                                    left: `${Math.min(95, Math.max(5, (goals[currentGoalIndex].currentAmount / goals[currentGoalIndex].amount) * 100))}%`,
                                                    transform: [{ translateX: -20 }]
                                                }}
                                                className="absolute -top-6 items-center"
                                            >
                                                <View
                                                    style={{ backgroundColor: '#1a1a2e' }}
                                                    className="px-2 py-0.5 rounded-md"
                                                >
                                                    <Text className="text-white text-[10px] font-bold">
                                                        {(() => {
                                                            const raw = (goals[currentGoalIndex].currentAmount / goals[currentGoalIndex].amount) * 100;
                                                            if (raw === 0) return '0%';
                                                            if (raw < 0.01) return '0.01%';
                                                            if (raw < 1) return raw.toFixed(2) + '%';
                                                            return Math.round(raw) + '%';
                                                        })()}
                                                    </Text>
                                                </View>
                                                <View
                                                    style={{
                                                        width: 0,
                                                        height: 0,
                                                        borderLeftWidth: 4,
                                                        borderRightWidth: 4,
                                                        borderTopWidth: 4,
                                                        borderLeftColor: 'transparent',
                                                        borderRightColor: 'transparent',
                                                        borderTopColor: '#1a1a2e',
                                                    }}
                                                />
                                            </View>

                                            <View className="flex flex-row items-center bg-black/5 rounded-full w-full h-2 overflow-hidden">
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${Math.max(0.01, Math.min(100, (goals[currentGoalIndex].currentAmount / goals[currentGoalIndex].amount) * 100))}%`,
                                                        backgroundColor: goals[currentGoalIndex].color
                                                    }}
                                                />
                                            </View>
                                        </View>

                                        <View className="flex flex-row items-center justify-between mt-1">
                                            <Text className="text-black/50 text-xs">{formatMonthYear(goals[currentGoalIndex].startDate)}</Text>
                                            <Text className="text-black/50 text-xs">{formatMonthYear(goals[currentGoalIndex].endDate)}</Text>
                                        </View>

                                        {goals.length > 1 && (
                                            <View className="flex-row items-center justify-center gap-1.5 mt-2">
                                                {goals.slice(0, 3).map((_, index) => (
                                                    <View
                                                        key={index}
                                                        style={{
                                                            width: currentGoalIndex === index ? 16 : 6,
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor: currentGoalIndex === index ? goals[currentGoalIndex].color : '#d1d5db',
                                                        }}
                                                    />
                                                ))}
                                                {goals.length > 3 && (
                                                    <Text className="text-black/30 text-xs ml-1">+{goals.length - 3}</Text>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ) : (
                                <View className="flex-1 items-center justify-center">
                                    <IconSymbol name="target" size={32} color="#d1d5db" />
                                    <Text className="text-black/40 text-sm mt-2">No goals yet</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                shadowColor: '#000',
                                shadowRadius: 12,
                                padding: 12,
                            }}
                            className="rounded-[24px] p-5 flex-1 justify-between bg-white border border-black/5 overflow-hidden"
                            onLongPress={lastTransactions.length > 0 && lastTransactions[0].receiptPositions && lastTransactions[0].receiptPositions.length > 0 ? () => setLastTransactionModalVisible(true) : undefined}
                            onPress={() => router.push('/(tabs)/explore')}
                        >
                            {lastTransactions.length > 0 ? (
                                <>
                                    <View>
                                        <Text className="text-black text-lg font-semibold mb-1">
                                            Last transaction
                                        </Text>
                                        <Text className="text-[#f87171] text-2xl font-bold">-{lastTransactions[0].amount.toFixed(2)}zł</Text>
                                        <Text className="text-black text-sm">{lastTransactions[0].shop.name}</Text>
                                    </View>
                                    <Text className="text-black text-sm">{formatDate(lastTransactions[0].date)} {formatTime(lastTransactions[0].time)}</Text>
                                    <Image
                                        source={getLogoSource(lastTransactions[0].shop.logoUrl)}
                                        className="w-24 h-24 object-contain absolute -bottom-6 -right-6 opacity-30 rounded-[12px]"
                                    />
                                </>
                            ) : (
                                <View className="flex-1 items-center justify-center">
                                    <Text className="text-black/50 text-sm">No transactions</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                    </View>
                </View>
                <TouchableOpacity onPress={() => { user?.family && router.push('/(family)/familyPage') }} className={`${user?.family && user.family.members.length >= 3 ? 'h-[200px]' : 'h-auto gap-4'} bg-white rounded-[24px] p-4 flex-col`} disabled={!user?.family} activeOpacity={0.8}>
                    <View className={'flex flex-row items-center gap-2'}>
                        <Text className="text-lg font-bold" style={styles.heading}>Family</Text>
                    </View>
                    {user?.family && user.family.members.length >= 3 && (
                        <View className="flex-row items-end justify-around flex-1">
                            {user.family.members.map((member: any, index: number) => {
                                const MAX_BAR_HEIGHT = 120;
                                const MIN_BAR_HEIGHT = 30;
                                const barHeight = MIN_BAR_HEIGHT + (member.budgetPercentage / 100) * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
                                return (
                                    <View
                                        key={index}
                                        style={{
                                            height: MAX_BAR_HEIGHT + 48,
                                            alignItems: 'center',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <View
                                            style={{
                                                position: 'absolute',
                                                bottom: 24,
                                                backgroundColor: familyUsersColors[index % familyUsersColors.length].background,
                                                width: 40,
                                                height: barHeight,
                                                borderTopLeftRadius: 20,
                                                borderTopRightRadius: 20,
                                            }}
                                        />
                                        <View
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 24,
                                                borderColor: familyUsersColors[index % familyUsersColors.length].border,
                                                borderWidth: 2,
                                                backgroundColor: familyUsersColors[index % familyUsersColors.length].background,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Text className="font-bold text-xl" style={{
                                                color: familyUsersColors[index % familyUsersColors.length].border,
                                            }}>
                                                {getInitials(member.firstName, member.lastName)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                    {user?.family && user.family.members.length < 3 && (
                        <View className={`${user.family.members.length === 1 ? 'mb-10' : ''} flex-col flex-1 justify-center gap-2`}>
                            {user.family.members.map((member: any, index: number) => {
                                const MAX_BAR_WIDTH = 200;
                                const MIN_BAR_WIDTH = 20;
                                const barWidth = MIN_BAR_WIDTH + (member.budgetPercentage / 100) * (MAX_BAR_WIDTH - MIN_BAR_WIDTH);
                                return (
                                    <View
                                        key={index}
                                        className="flex-row items-center"
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                borderColor: familyUsersColors[index % familyUsersColors.length].border,
                                                borderWidth: 2,
                                                backgroundColor: familyUsersColors[index % familyUsersColors.length].background,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 1,
                                            }}
                                        >
                                            <Text className="font-bold text-lg" style={{
                                                color: familyUsersColors[index % familyUsersColors.length].border,
                                            }}>
                                                {getInitials(member.firstName, member.lastName)}
                                            </Text>
                                        </View>
                                        <View
                                            style={{
                                                marginLeft: -20,
                                                paddingLeft: 24,
                                                backgroundColor: familyUsersColors[index % familyUsersColors.length].background,
                                                width: barWidth,
                                                height: 32,
                                                borderTopRightRadius: 16,
                                                borderBottomRightRadius: 16,
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Text className="font-semibold text-xs" style={{
                                                color: familyUsersColors[index % familyUsersColors.length].border,
                                            }}>
                                                {Math.round(member.budgetPercentage)}%
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                    {!user?.family &&

                        <View className="flex-col items-center justify-center flex-1">
                            {createLoading || joinLoading ? (
                                <ActivityIndicator size="large" color="6B5AED" />
                            ) : (
                                <>
                                    {!user?.premium && familyStep === 'lock' && (
                                        <TouchableOpacity
                                            className="flex-col items-center justify-center flex-1"
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setFamilyAction('join'); setFamilyStep('enterCode');
                                            }}
                                        >
                                            <IconSymbol name="lock" size={48} color="black" />
                                            <Text className="text-black/50 text-sm">Tap to join a family</Text>
                                        </TouchableOpacity>
                                    )}

                                    {user?.premium && familyStep === 'menu' && (
                                        <View className="flex-row items-center justify-center flex-1">
                                            <TouchableOpacity
                                                className="flex-col items-center flex-1 gap-4"
                                                activeOpacity={0.7}
                                                onPress={() => { setFamilyAction('create'); setFamilyStep('shareLevel'); }}
                                            >
                                                <IconSymbol name="plus" size={48} color="#6b7280" />
                                                <Text className="text-black/50 text-sm">Create family</Text>
                                            </TouchableOpacity>
                                            <View className="border-l border-gray-200 h-full" />
                                            <TouchableOpacity
                                                className="flex-col items-center flex-1 gap-4"
                                                activeOpacity={0.7}
                                                onPress={() => { setFamilyAction('join'); setFamilyStep('enterCode'); }}
                                            >
                                                <IconSymbol name="envelope" size={48} color="#6b7280" />
                                                <Text className="text-black/50 text-sm">Join family</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {familyStep === 'enterCode' && (
                                        <View className="flex-col items-center w-full">
                                            <View className="flex-row justify-center gap-2 mb-4">
                                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                                    <TextInput
                                                        key={i}
                                                        ref={(ref) => { codeInputRefs.current[i] = ref; }}
                                                        className="w-10 h-12 bg-gray-100 rounded-lg text-center text-xl font-bold text-black"
                                                        maxLength={1}
                                                        autoCapitalize="characters"
                                                        value={inputCode[i] || ''}
                                                        onChangeText={(text) => {
                                                            const newCode = inputCode.split('');
                                                            newCode[i] = text.toUpperCase();
                                                            setInputCode(newCode.join(''));
                                                            if (text && i < 5) {
                                                                codeInputRefs.current[i + 1]?.focus();
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </View>
                                            <View className="flex-row items-center w-full">
                                                <View className="flex-1" />
                                                <TouchableOpacity
                                                    className={`rounded-full py-3 px-12 ${inputCode.length === 6 ? 'bg-accent' : 'bg-gray-300'}`}
                                                    activeOpacity={inputCode.length === 6 ? 0.7 : 1}
                                                    onPress={() => {
                                                        if (inputCode.length === 6) {
                                                            setFamilyStep('shareLevel');
                                                        }
                                                    }}
                                                >
                                                    <Text className={`text-lg font-semibold ${inputCode.length === 6 ? 'text-white' : 'text-gray-500'}`}>Next</Text>
                                                </TouchableOpacity>
                                                <View className="flex-1 items-end">
                                                    <TouchableOpacity
                                                        className="rounded-full bg-gray-400 p-3"
                                                        onPress={() => {
                                                            setFamilyStep(user?.premium ? 'menu' : 'lock');
                                                            setInputCode('');
                                                        }}
                                                    >
                                                        <IconSymbol name="xmark" size={20} color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {familyStep === 'shareLevel' && (
                                        <View className="flex-col items-center w-full gap-3">
                                            <View className="flex-row items-center gap-2">
                                                <TouchableOpacity
                                                    className={`rounded-full p-3 ${shareLevel === 'NONE' ? 'bg-accent' : 'bg-gray-300'}`}
                                                    onPress={() => setShareLevel('NONE')}
                                                >
                                                    <Text className={`text-sm font-semibold ${shareLevel === 'NONE' ? 'text-white' : 'text-gray-600'}`}>None</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    className={`rounded-full p-3 ${shareLevel === 'SUMMARY' ? 'bg-accent' : 'bg-gray-300'}`}
                                                    onPress={() => setShareLevel('SUMMARY')}
                                                >
                                                    <Text className={`text-sm font-semibold ${shareLevel === 'SUMMARY' ? 'text-white' : 'text-gray-600'}`}>Summary</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    className={`rounded-full p-3 ${shareLevel === 'ALL' ? 'bg-accent' : 'bg-gray-300'}`}
                                                    onPress={() => setShareLevel('ALL')}
                                                >
                                                    <Text className={`text-sm font-semibold ${shareLevel === 'ALL' ? 'text-white' : 'text-gray-600'}`}>All</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <Text className="text-center text-xs text-black/60 px-2">
                                                {shareLevel === 'NONE'
                                                    ? <>Users will see only your <Text className="font-bold">budget progress %</Text></>
                                                    : shareLevel === 'SUMMARY'
                                                        ? <>Users will see your <Text className="font-bold">budget progress %</Text> and <Text className="font-bold">total balance</Text></>
                                                        : <>Users will see your <Text className="font-bold">budget progress %</Text>, <Text className="font-bold">balance</Text> and <Text className="font-bold">all transactions</Text></>
                                                }
                                            </Text>
                                            <View className="flex-row items-center w-full mt-2">
                                                <View className="flex-1" />
                                                <TouchableOpacity
                                                    className="rounded-full bg-accent py-3 px-12"
                                                    onPress={() => { familyAction === 'create' ? handleCreateFamily() : handleJoinFamily() }}
                                                >
                                                    <Text className="text-white text-lg font-semibold">
                                                        {familyAction === 'create' ? 'Create' : 'Join'}
                                                    </Text>
                                                </TouchableOpacity>
                                                <View className="flex-1 items-end">
                                                    <TouchableOpacity
                                                        className="rounded-full bg-gray-400 p-3"
                                                        onPress={() => {
                                                            if (user?.premium) {
                                                                setFamilyStep(familyAction === 'join' ? 'enterCode' : 'menu');
                                                            } else {
                                                                setFamilyStep('enterCode');
                                                            }
                                                            setShareLevel('NONE');
                                                        }}
                                                    >
                                                        <IconSymbol name="xmark" size={20} color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </>
                            )}

                        </View>
                    }
                    {joinError && (
                        <Text className="text-red-400 text-center font-semibold mt-1">{joinError}</Text>
                    )}
                    {createError && (
                        <Text className="text-red-400 text-center font-semibold mt-1">{createError}</Text>
                    )}
                </TouchableOpacity>
                {/* UPCOMING PAYMENTS SECTION */}
                <TouchableOpacity
                    className="rounded-[24px] bg-[white] p-4 border border-black/5"
                    onPress={() => router.push('/(tabs)/subscriptions')}
                    activeOpacity={0.7}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Text className="text-black text-lg font-bold">Upcoming Payments</Text>
                        </View>
                    </View>
                    {subscriptions.length === 0 ? (
                        <View className="items-center justify-center py-4">
                            <Text className="text-black/50 text-lg font-medium">No upcoming payments</Text>
                        </View>
                    ) : (
                        subscriptions.slice(0, 3).map((subscription: Subscription, index: number) => {
                            const paymentDate = new Date(subscription.paymentDate);
                            const now = new Date();
                            const diffTime = paymentDate.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            return (
                                <React.Fragment key={subscription.id}>
                                    {index > 0 && <View className="h-[1px] bg-black/5 w-full my-2" />}
                                    <View
                                        className="flex-row items-center justify-between px-4 py-2 bg-white rounded-[24px]"
                                    >
                                        <View className="flex-row items-center gap-3 flex-1">
                                            <View
                                                style={{ backgroundColor: subscription.color + '15' }}
                                                className="w-12 h-12 rounded-[12px] items-center justify-center overflow-hidden"
                                            >
                                                <Image
                                                    source={getLogoSource(subscription.shop.logoUrl)}
                                                    className="w-12 h-12 rounded-[12px]"
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-black font-semibold">{subscription.shop.name}</Text>
                                                <Text className="text-black/50 text-xs">{subscription.period === 'MONTHLY' ? 'Monthly' : subscription.period === 'YEARLY' ? 'Yearly' : 'One-time'}</Text>
                                            </View>
                                        </View>
                                        <View className="items-end">
                                            <Text className="font-bold text-[#f87171]">-{parseFloat(subscription.price).toFixed(2)} zł</Text>
                                            <View className="flex-row items-center gap-1 mt-0.5">
                                                <Text className="text-black text-xs font-medium">
                                                    {diffDays <= 0 ? (
                                                        <Text className="text-[#f87171]">Today</Text>
                                                    ) : (
                                                        <>in <Text className="text-[#f87171]">{diffDays}d</Text></>
                                                    )}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </React.Fragment>
                            );
                        })
                    )}
                </TouchableOpacity>

                {/* CHART SECTION */}
                <Animated.View
                    style={{
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 4,
                        height: 240,
                        opacity: fadeAnim,
                    }}
                    className="rounded-3xl bg-white p-5 border border-black/5"
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-black text-lg font-bold">
                            Weekly Spending
                        </Text>
                        <TouchableOpacity>
                            <IconSymbol name="arrow.up.right" size={18} color="#6b5aed" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 flex-row items-end justify-between gap-2 mt-6">
                        {chartData.map((item, index) => (
                            <View key={index} className="flex-1 items-center gap-2">
                                <View
                                    style={{ height: item.height * MAX_BAR_HEIGHT }}
                                    className={`w-full ${index === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) ? 'bg-[#6b5aed]' : 'bg-[#6b5aed]/80'} rounded-lg`}
                                />
                                <View className="items-center">
                                    <Text className="text-black/70 text-xs font-medium">{item.day}</Text>
                                    <Text className="text-black/60 text-[10px]">{item.amount.toFixed(0)} zł</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>
                <LastTransactionModal
                    visible={lastTransactionModalVisible}
                    onClose={() => setLastTransactionModalVisible(false)}
                    transaction={lastTransactions.length > 0 ? lastTransactions[0] : null}
                />
            </LinearGradient>

        </ScrollView>
    );
}
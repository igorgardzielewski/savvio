import {View, ScrollView, Image, TouchableOpacity, Animated, StyleSheet, Pressable} from 'react-native';
import React, {useRef, useState} from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {useRouter} from "expo-router";
import LastTransactionModal from "@/components/ui/LastTransactionModal";
import {Text} from '@/components/ui/Text'
import { LinearGradient } from 'expo-linear-gradient';
import {CircularProgressBase} from "react-native-circular-progress-indicator";
import {useUserStore} from "@/store/userStore";
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
        gap:24,
        // optional: borderRadius: 20,
    },
});
export default function App() {
    const router = useRouter();
    const currentBudget = useUserStore(state => state.user?.currentBudget ?? null);
    const rawCategories = currentBudget?.budgetCategories;
    const budgetCategories = Array.isArray(rawCategories) ? rawCategories.filter(Boolean) : [];
    const [lastTransactionModalVisible, setLastTransactionModalVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.stagger(50, [
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim]);

    const MAX_BAR_HEIGHT = 120;
    return (
        <ScrollView
            className="flex-1 "
            contentContainerStyle={{
                gap: 24,
            }}
            showsVerticalScrollIndicator={false}
        >
            <LinearGradient
                colors={['#f2f0ff', '#e2deff']}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 0.4}}
                style={styles.gradient}
            >

                <View className={'gap-0'}>
                    <View className="flex flex-row items-center justify-between">
                        <Text className="text-[#120f29] text-xl font-medium" style={styles.heading}>Your budget<Text className={'text-sm font-medium '}>&nbsp;in November</Text></Text>
                    </View>

                    <View className="flex-row items-baseline">
                        <Text className="text-danger text-[50px] font-bold">{currentBudget?.spent ?? 0}</Text>
                        <Text className="text-lg font-bold" style={styles.amountMeta}>&nbsp;z {currentBudget?.budgetLimit ?? 0} zł
                        </Text>
                    </View>
                    <View className="w-full flex flex-row items-start gap-3 mt-2">
                        <TouchableOpacity className="rounded-full flex-1 py-4 px-2 items-center flex flex-row gap-2 justify-center bg-[#6b5aed]" onPress={()=>router.push('/(addexpense)/ManuallyAdd')}>
                            <Text className={'font-medium text-white text-2xl'}>Add</Text>
                            <IconSymbol name="plus" color="white" weight={'bold'} size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity className="rounded-full flex-1 py-4 px-2 items-center flex flex-row gap-2 justify-center bg-white" onPress={()=>router.push('/(addexpense)/ScanReceipt')}>
                            <Text className={'font-medium text-[#6b5aed] text-2xl'}>Scan</Text>
                            <IconSymbol name="camera" color="#6b5aed" weight={'bold'} size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity className="rounded-full  py-4 px-4 items-center flex flex-row gap-2 justify-center bg-white h-full">
                            <IconSymbol name="ellipsis" color="#6b5aed" weight="bold" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: -8, alignItems: 'center',gap:8}}
                >
                    {budgetCategories.map((category) => {
                        if(!category) return null;
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
                                    inActiveStrokeColor={(category.color || '#6b5aed')+'30'}
                                    strokeLinecap="butt"
                                    rotation={0}
                                    clockwise={false}
                                >
                                    <View style={{ alignItems: 'center' }}>
                                        <IconSymbol name={category.iconUri} color={category.color || '#6b5aed'} weight="bold" size={24} />
                                    </View>
                                </CircularProgressBase>
                            </View>
                        );
                    })}
                    <TouchableOpacity className={'bg-white rounded-full items-center p-2 justify-center'} key="add" onPress={()=>router.push('/(tabs)/budget')} activeOpacity={0.6}>
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
                <View className="rounded-[24px] bg-white p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold" style={styles.heading}>Recent Activity</Text>
                    </View>

                    {/* Transaction List */}
                    {[
                        { name: 'Uber Eats', category: 'Fast Food', amount: -49.45, time: '10:22', logo: require('@/assets/images/ubereats.png') },
                        { name: 'Biedronka', category: 'Groceries', amount: -123.50, time: '14:32', logo: require('@/assets/images/biedronka.png') },
                    ].map((transaction, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <View className="h-[1px] bg-black/5 w-full my-3" />}
                            <TouchableOpacity
                                className="flex-row items-center justify-between"
                                onPress={() => router.push('/(tabs)/explore')}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center gap-3">
                                    <Image
                                        source={transaction.logo}
                                        className="w-12 h-12 rounded-[12px]"
                                    />
                                    <View>
                                        <Text className="text-black font-semibold">{transaction.name}</Text>
                                        <Text className="text-black/50 text-xs">{transaction.category}</Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="font-bold text-[#f87171]">{transaction.amount} zł</Text>
                                    <Text className="text-black/50 text-xs">{transaction.time}</Text>
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
                            onPress={() => router.push('/(aiassistant)/howitworks')}
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
                        {/* You Saved Card */}
                        <View
                            style={{
                                padding: 12,
                            }}
                            className="rounded-[28px] p-5 flex-1 justify-between bg-[#16c47f] border border-black/5"
                        >
                            <View>
                                <Text className="text-white/70 text-sm font-medium mb-1">
                                    You saved
                                </Text>
                                <Text className="text-white text-2xl font-bold">555,51 zł</Text>
                                <Text className="text-white/70 text-sm">in September</Text>
                            </View>

                            <Pressable className="rounded-full py-2.5 px-4 items-center justify-center border-2 border-white/30 bg-white/10 mt-3">
                                <Text className="text-white font-semibold text-sm">Show more</Text>
                            </Pressable>
                        </View>

                        {/* Last Transaction Card */}
                        <TouchableOpacity
                            style={{
                                shadowColor: '#000',
                                shadowRadius: 12,
                                padding: 12,
                            }}
                            className="rounded-[24px] p-5 flex-1 justify-between bg-white border border-black/5"
                            onLongPress={() => setLastTransactionModalVisible(true)}
                            onPress={() => router.push('/(tabs)/explore')}
                        >
                            <View>
                                <Text className="text-black text-sm font-medium mb-1">
                                    Last transaction
                                </Text>
                                <Text className="text-[#f87171] text-2xl font-bold">-49,45zł</Text>
                                <Text className="text-black text-sm">Uber Eats</Text>
                            </View>
                            <Text className="text-black text-sm">25.10.2025 10:22</Text>
                        </TouchableOpacity>

                    </View>
                </View>

                {/* UPCOMING PAYMENTS SECTION */}
                <View className="rounded-[24px] bg-[white] p-4 border border-black/5">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Text className="text-black text-lg font-bold">Upcoming Payments</Text>
                        </View>
                    </View>
                    {[
                        {
                            name: 'Netflix',
                            category: 'Subscription',
                            amount: 60.00,
                            dueDate: '10 Nov',
                            daysLeft: 1,
                            image: require("@/assets/images/netflix.jpeg"),
                            color: '#e50914'
                        },
                        {
                            name: 'Spotify Premium',
                            category: 'Subscription',
                            amount: 23.99,
                            dueDate: '15 Nov',
                            daysLeft: 3,
                            image: require("@/assets/images/spotify.png"),
                            color: '#1db954'
                        },
                    ].map((payment, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <View className="h-[1px] bg-black/5 w-full my-2" />}
                            <View
                                className="flex-row items-center justify-between px-4 py-2 bg-white rounded-[24px]"
                            >
                                <View className="flex-row items-center gap-3 flex-1">
                                    <View
                                        style={{ backgroundColor: payment.color + '15' }}
                                        className="w-12 h-12 rounded-[12px] items-center justify-center"
                                    >
                                        <Image
                                            source={payment.image}
                                            className="w-12 h-12 rounded-[12px]"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-black font-semibold">{payment.name}</Text>
                                        <Text className="text-black/50 text-xs">{payment.category}</Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="font-bold text-[#f87171]">-{payment.amount.toFixed(2)} zł</Text>
                                    <View className="flex-row items-center gap-1 mt-0.5">
                                        <Text className="text-black text-xs font-medium">
                                            in <Text className="text-[#f87171]">{payment.daysLeft}d</Text>
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </React.Fragment>
                    ))}
                </View>

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
                        {[
                            { day: 'Mon', amount: 150, height: 0.60 },
                            { day: 'Tue', amount: 230, height: 0.92 },
                            { day: 'Wed', amount: 180, height: 0.72 },
                            { day: 'Thu', amount: 95,  height: 0.38 },
                            { day: 'Fri', amount: 250, height: 1.00 },
                            { day: 'Sat', amount: 120, height: 0.48 },
                            { day: 'Sun', amount: 80,  height: 0.32 },
                        ].map((item, index) => (
                            <View key={index} className="flex-1 items-center gap-2">
                                <View
                                    style={{ height: item.height * MAX_BAR_HEIGHT }}
                                    className={`w-full ${index === 4 ? 'bg-[#6b5aed]' : 'bg-[#6b5aed]/80'} rounded-lg`}
                                />
                                <View className="items-center">
                                    <Text className="text-black/70 text-xs font-medium">{item.day}</Text>
                                    <Text className="text-black/60 text-[10px]">{item.amount} zł</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>
                <LastTransactionModal
                    visible={lastTransactionModalVisible}
                    onClose={() => setLastTransactionModalVisible(false)}
                />
            </LinearGradient>

        </ScrollView>
    );
}
import {BudgetCategory} from "@/types";
import {SafeAreaView} from "react-native-safe-area-context";
import {useLocalSearchParams, useRouter} from "expo-router";
import {View, ScrollView, TouchableOpacity, TextInput, Animated, Image} from "react-native";
import {Text} from '@/components/ui/Text'
import {SFSymbols6_0} from "sf-symbols-typescript";
import {IconSymbol} from "@/components/ui/icon-symbol";
import React from "react";
import { CircularProgressBase } from 'react-native-circular-progress-indicator';
import TransactionDetailModal from "@/components/TransactionDetailModal";
import {getBudgetColorHex} from "@/helpers/helpers";
type Category =  {
    name: string,
    color: string,
    amount: number,
    budgetPercentage: number,
    percentage: number,
    icon: SFSymbols6_0,
}
const categories = [
    {
        name: "Fast Food",
        color: "#72c7aa",
        amount: 1250,
        budgetPercentage: 20,
        percentage: 45,
        icon: "takeoutbag.and.cup.and.straw",
    },
    {
        name: "Groceries",
        color: "#7c65fb",
        amount: 1250,
        budgetPercentage: 65,
        percentage: 45,
        icon: "cart"
    },
    {
        name: "Taxi",
        color: "#e37a9e",
        budgetPercentage: 15,
        amount: 1250,
        percentage: 45,
        icon: "car"
    },
] as Category[]

const transactions = [
    {
        date: '10 września',
        dailyTotal: '+31,05 zł',
        items: [
            {
                id: 1,
                name: 'Uber Eats',
                category: 'Fast Food',
                time: '19:01',
                amount: -49.45,
                logo: require('@/assets/images/ubereats.png'),
                categoryIcon: 'takeoutbag.and.cup.and.straw' as SFSymbols6_0,
                categoryColor: '#72c7aa'
            }
        ]
    },
    {
        date: '9 września',
        dailyTotal: '+31,05 zł',
        items: [
            {
                id: 2,
                name: 'Uber Eats',
                category: 'Fast Food',
                time: '19:01',
                amount: -49.45,
                logo: require('@/assets/images/ubereats.png'),
                categoryIcon: 'takeoutbag.and.cup.and.straw' as SFSymbols6_0,
                categoryColor: '#72c7aa'
            },
            {
                id: 3,
                name: 'Biedronka',
                category: 'Groceries',
                time: '14:32',
                amount: -123.50,
                logo: require('@/assets/images/biedronka.png'),
                categoryIcon: 'cart' as SFSymbols6_0,
                categoryColor: '#7c65fb'
            }
        ]
    },
    {
        date: '8 września',
        dailyTotal: '+31,05 zł',
        items: [
            {
                id: 4,
                name: 'Uber Eats',
                category: 'Fast Food',
                time: '20:15',
                amount: -49.45,
                logo: require('@/assets/images/ubereats.png'),
                categoryIcon: 'takeoutbag.and.cup.and.straw' as SFSymbols6_0,
                categoryColor: '#72c7aa'
            },
            {
                id: 5,
                name: 'Bolt',
                category: 'Taxi',
                time: '18:22',
                amount: -35.00,
                logo: require('@/assets/images/bolt.jpeg'),
                categoryIcon: 'car' as SFSymbols6_0,
                categoryColor: '#e37a9e'
            },
            {
                id: 6,
                name: 'Lidl',
                category: 'Groceries',
                time: '12:10',
                amount: -89.99,
                logo: require('@/assets/images/lidl.jpeg'),
                categoryIcon: 'cart' as SFSymbols6_0,
                categoryColor: '#7c65fb'
            },
            {
                id: 7,
                name: 'Zalando',
                category: 'Clothing',
                time: '12:10',
                amount: -89.99,
                logo: require('@/assets/images/zalando.jpeg'),
                categoryIcon: 'tshirt' as SFSymbols6_0,
                categoryColor: '#7c65fb'
            }
        ]
    }
];
export default function BudgetDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [selectedTransaction, setSelectedTransaction] = React.useState(null);
    const [detailModalVisible, setDetailModalVisible] = React.useState(false);
    const category: BudgetCategory = {
        id: Number(params.id),
        name: params.name as string,
        icon: params.icon as SFSymbols6_0,
        color: params.color as string,
        allocated: Number(params.allocated),
        spent: Number(params.spent),
    }
    const props = {
        activeStrokeWidth: 25,
        inActiveStrokeWidth: 25,
    };
    const [isOverviewActive, setIsOverviewActive] = React.useState<boolean>(false);
    const percentageSpent = category.allocated > 0
        ? Math.min(100, (category.spent / category.allocated) * 100)
        : 0;
    const remaining = category.allocated - category.spent;
    let transactionIndex = 0;

    return (
        <SafeAreaView edges={['top']} className="flex-1" style={{backgroundColor: category.color}}>
            <View className="px-6 pt-4 min-h-[20%] justify-between">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-14 h-14 bg-white/20 rounded-full items-center justify-center"
                    >
                        <IconSymbol name="chevron.left" size={20} color="white" weight="bold" />
                    </TouchableOpacity>
                    <TouchableOpacity className="w-14 h-14 bg-white/20 rounded-full items-center justify-center">
                        <IconSymbol name="ellipsis" size={20} color="white" weight="bold" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center max-w-[70%] break-words">
                    <View>
                        <Text className="text-white text-[36px] font-bold">{category.name}</Text>
                    </View>
                </View>
                <View className="absolute right-[-16px] bottom-[-16px]">
                    <IconSymbol
                        name={category.icon}
                        size={128}
                        color="white"
                        style={{ opacity: 0.4 }}
                    />
                </View>
            </View>

            <View className="flex-1 bg-[#f5f5f7] rounded-t-[32px] pt-6 px-6">
                <View className={'bg-white py-2 px-2 items-center justify-center flex-row flex rounded-full'}>
                    <TouchableOpacity
                        className={`flex-1 px-6 py-4 rounded-full`}
                        style={{backgroundColor: !isOverviewActive ? category.color : 'white'}}
                        onPress={() => setIsOverviewActive(false)}
                    >
                        <Text
                            className={`text-center ${!isOverviewActive ? 'font-bold' : 'font-semibold'}`}
                            style={{color:!isOverviewActive ? 'white' : category.color}}
                        >
                            Transactions
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 px-6 py-4 rounded-full`}
                        style={{backgroundColor: isOverviewActive ? category.color : 'white'}}
                        onPress={() => setIsOverviewActive(true)}
                    >
                        <Text
                            className={`text-center ${isOverviewActive ? 'font-bold' : 'font-semibold'}`}
                            style={{color:isOverviewActive ? 'white' : category.color}}
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
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{justifyContent: 'center', alignItems:'center',gap:16, paddingBottom:50,paddingTop:16}}>
                    {isOverviewActive ? (
                        <>
                            {/* Circular Progress */}
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
                                        <Text className={'font-bold text-4xl'} style={{color: getBudgetColorHex(category.spent,category.allocated)}}>
                                            {category.spent.toFixed(2)}zł
                                        </Text>
                                        <Text className="text-gray-500 text-sm mt-1">
                                            of {category.allocated.toFixed(2)}zł
                                        </Text>
                                    </View>
                                </CircularProgressBase>
                            </View>

                            {/* Budget Stats Cards */}
                            <View className="w-full gap-4">
                                {/* Remaining Budget */}
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
                                        {/*<View className="w-12 h-12 rounded-2xl items-center justify-center">*/}
                                        {/*    <IconSymbol name="banknote.fill" size={24} color={category.color}/>*/}
                                        {/*</View>*/}
                                    </View>
                                    <View className={'mb-2'}>
                                        <Text className="text-3xl font-bold" style={{color: getBudgetColorHex(category.spent,category.allocated)}}>
                                            {remaining.toFixed(2)}zł
                                        </Text>
                                        <Text className="text-black/40 text-xs font-medium">
                                            {percentageSpent.toFixed(1)}% of budget spent
                                        </Text>
                                    </View>
                                </View>

                                {/* Split Cards Row */}
                                <View className="flex-row gap-4">
                                    {/* Allocated */}
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
                                            {/*<View className="w-10 h-10 rounded-xl items-center justify-center">*/}
                                            {/*    <IconSymbol name="chart.bar.fill" size={20} color={category.color} />*/}
                                            {/*</View>*/}
                                        </View>
                                        <View className={'mb-2'}>
                                        <Text className="text-2xl font-bold" style={{color: category.color}}>
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
                                            {/*<View className="w-10 h-10 rounded-xl items-center justify-center">*/}
                                            {/*    <IconSymbol name="creditcard.fill" size={20} color={category.color} />*/}
                                            {/*</View>*/}
                                        </View>
                                        <View className={'mb-2'}>
                                            <Text className="text-2xl font-bold" style={{color: getBudgetColorHex(category.spent,category.allocated)}}>
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
                                        <Text className="text-3xl font-bold" style={{color: category.color}}>
                                            {(category.spent / new Date().getDate()).toFixed(2)}zł
                                        </Text>
                                        <Text className="text-black/40 text-xs font-medium">
                                            Based on current month
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    ) : (
                        <View className={'w-full flex flex-col items-center justify-center gap-6'}>
                                {transactions.map((day, dayIndex) => (
                                    <View key={dayIndex} className={'w-full flex flex-col items-start justify-start'}>
                                        {/* Date Badge */}
                                        <View className={'w-full flex flex-row items-center justify-between'}>
                                            <View className="bg-white rounded-t-[24px] px-4 py-2 self-start">
                                                <Text className={'font-bold text-base'}>{day.date}</Text>
                                            </View>
                                            <Text className={'font-semibold text-xs text-black/60'}>{day.dailyTotal}</Text>
                                        </View>

                                        {/* Transactions Card */}
                                        <Animated.View
                                            className={'w-full flex flex-col items-center justify-between gap-4 rounded-b-[24px] rounded-tr-[24px] bg-white p-4'}
                                        >
                                            {day.items.map((transaction, itemIndex) => {
                                                const currentIndex = transactionIndex++;
                                                return (
                                                    <React.Fragment key={transaction.id}>
                                                        {itemIndex > 0 && (
                                                            <View className={'h-[1px] bg-black/5 w-full'}></View>
                                                        )}
                                                        <TouchableOpacity
                                                            className={'w-full flex flex-row items-center justify-between'}
                                                            activeOpacity={0.7}
                                                            onPress={() => {
                                                                setSelectedTransaction({
                                                                    ...transaction,
                                                                    date: day.date,
                                                                    paymentMethod: "Card •••• 1234",
                                                                    location: "Warsaw, Ursynów",
                                                                    notes: "Delivery to office"
                                                                });
                                                                setDetailModalVisible(true);
                                                            }}
                                                        >
                                                            <View className={'flex flex-row items-center gap-3 h-full'}>
                                                                <View className="relative">
                                                                    <Image
                                                                        source={transaction.logo}
                                                                        className="w-14 h-14 object-contain overflow-hidden self-center rounded-[12px]"
                                                                    />
                                                                    <View
                                                                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
                                                                        style={{ backgroundColor: transaction.categoryColor }}
                                                                    >
                                                                        <IconSymbol
                                                                            name={transaction.categoryIcon}
                                                                            size={12}
                                                                            color="white"
                                                                        />
                                                                    </View>
                                                                </View>
                                                                <View className={'flex flex-col justify-center gap-1'}>
                                                                    <Text className={'font-bold text-base'}>{transaction.name}</Text>
                                                                    <View className="flex flex-row items-center gap-2">
                                                                        <Text className={'text-xs text-black/50'}>{transaction.time}</Text>
                                                                        <View className="w-1 h-1 rounded-full bg-black/30" />
                                                                        <Text className={'text-xs text-black/50'}>{transaction.category}</Text>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            <Text className={'text-lg font-bold'} style={{
                                                                color: transaction.amount < 0 ? '#f87171' : '#16c47f'
                                                            }}>
                                                                {transaction.amount < 0 ? '-' : '+'}{Math.abs(transaction.amount).toFixed(2)}zł
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </Animated.View>
                                    </View>
                                ))}
                            <TransactionDetailModal
                                visible={detailModalVisible}
                                onClose={() => setDetailModalVisible(false)}
                                transaction={selectedTransaction}
                            />
                        </View>
                        // <View className="flex-1 items-center justify-center py-12">
                        //     <IconSymbol name="list.bullet" size={48} color={category.color} style={{opacity: 0.3}} />
                        //     <Text className="text-gray-500 text-base mt-4">No transactions yet</Text>
                        // </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
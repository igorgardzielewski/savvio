import {View, TouchableOpacity, ScrollView, Dimensions, Animated, Image, TextInput} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {IconSymbol} from "@/components/ui/icon-symbol";
import React, {useEffect, useRef} from "react";
import {useRouter} from "expo-router";
import {SFSymbols6_0} from "sf-symbols-typescript";
import TransactionDetailModal from "@/components/TransactionDetailModal";
import {Text} from '@/components/ui/Text'

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

const {width: screenWidth} = Dimensions.get('window');
const PADDING_HORIZONTAL = 8;
const GAP = 8;
const CARD_WIDTH_SMALL = screenWidth * 0.35;
const CARD_WIDTH_LARGE = screenWidth * 0.96;

export default function TabTwoScreen() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = React.useState<Category | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const widthAnims = React.useRef(
        categories.map(() => new Animated.Value(CARD_WIDTH_SMALL))
    ).current;
    const opacityAnims = React.useRef(
        categories.map(() => new Animated.Value(1))
    ).current;
    const fadeAnims = React.useRef(
        transactions.flatMap(day => day.items.map(() => new Animated.Value(0)))
    ).current;
    const [selectedTransaction, setSelectedTransaction] = React.useState(null);
    const [detailModalVisible, setDetailModalVisible] = React.useState(false);

    React.useEffect(() => {
        const activeIndex = categories.findIndex(category => category.name === activeCategory?.name);

        categories.forEach((category, index) => {
            const isActive = activeCategory?.name === category.name;

            Animated.parallel([
                Animated.spring(widthAnims[index], {
                    toValue: isActive ? CARD_WIDTH_LARGE : CARD_WIDTH_SMALL,
                    useNativeDriver: false,
                    tension: 80,
                    friction: 10,
                }),
                Animated.timing(opacityAnims[index], {
                    toValue: activeCategory && !isActive ? 0 : 1,
                    duration: 200,
                    useNativeDriver: false,
                })
            ]).start();
        });

        if (activeCategory && activeIndex !== -1) {
            let scrollX = 0;
            for (let i = 0; i < activeIndex; i++) {
                scrollX += CARD_WIDTH_SMALL + GAP;
            }
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({x: Math.max(0, scrollX), animated: true});
            }, 100);
        }
    }, [activeCategory]);

    React.useEffect(() => {
        // Animacja fade-in dla transakcji
        Animated.stagger(50,
            fadeAnims.map(anim =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                })
            )
        ).start();
    }, []);

    const calculateEndPadding = () => {
        const basePadding = (screenWidth - CARD_WIDTH_SMALL) / 2;

        if (!activeCategory) return basePadding;

        const activeIndex = categories.findIndex(cat => cat.name === activeCategory.name);
        if (activeIndex === -1) return basePadding;

        const cardsAfter = categories.length - activeIndex - 1;
        const spaceNeeded = cardsAfter * (CARD_WIDTH_SMALL + GAP);
        const centerOffset = (screenWidth - CARD_WIDTH_LARGE - PADDING_HORIZONTAL * 2) / 2;

        return Math.max(basePadding, centerOffset - spaceNeeded + GAP);
    };

    let transactionIndex = 0;

    return (
        <SafeAreaView className={'bg-[#f2f0ff] flex h-full justify-start px-4 pt-3'} edges={[]}>
            <View className={'-mx-4 gap-4'}>
                <ScrollView
                    className={'w-full gap-4 flex px-2'}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{gap: GAP, paddingRight: activeCategory ? calculateEndPadding() : 0}}
                    ref={scrollViewRef as any}
                    scrollEnabled={!activeCategory}
                >
                    {categories.map((category, index) => {
                        const isActive = activeCategory?.name === category.name;
                        return (
                            <Animated.View
                                key={`${category.name}-${index}`}
                                style={{
                                    width: widthAnims[index],
                                    opacity: opacityAnims[index],
                                }}
                            >
                                <TouchableOpacity
                                    className="relative flex flex-row items-start justify-start gap-4 w-full h-[164px] rounded-[24px] p-4 overflow-hidden shadow-sm"
                                    style={{ backgroundColor: category.color }}
                                    onPress={() => {
                                        setActiveCategory(activeCategory?.name === category.name ? null : category);
                                    }}
                                    disabled={activeCategory !== null && activeCategory.name !== category.name}
                                >
                                    <View className="flex-1 justify-between flex flex-col gap-2">
                                        <View>
                                            <Text className="text-white font-bold text-2xl">
                                                {category.name.split(' ').join('\n')}
                                            </Text>
                                            <Text className="text-white/70 text-sm mt-1">
                                                {category.budgetPercentage}% of your budget
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="w-2 h-full bg-white/20 rounded-full overflow-hidden">
                                        <View
                                            className="w-full bg-white/70 rounded-full"
                                            style={{
                                                height: `${category.budgetPercentage}%`,
                                                alignSelf: 'flex-end',
                                                position: 'absolute',
                                                bottom: 0,
                                            }}
                                        />
                                    </View>
                                    <View className="absolute left-[-16px] bottom-0">
                                        <IconSymbol
                                            name={category.icon}
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
                    <Text className={'text-[#6b5aed] font-bold text-xl'}>1,673.80 zł</Text>
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
                            style={{
                                opacity: fadeAnims[transactionIndex] || 1,
                            }}
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
            </ScrollView>
            <TransactionDetailModal
                visible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                transaction={selectedTransaction}
            />
        </SafeAreaView>
    );
}
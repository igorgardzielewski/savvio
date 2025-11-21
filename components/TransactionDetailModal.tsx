import React from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView
} from "react-native";
import {IconSymbol} from "@/components/ui/icon-symbol";
import {LinearGradient} from 'expo-linear-gradient';
import {MotiView} from "moti";
import MapView from "react-native-maps";
import {Text} from '@/components/ui/Text'

enum TransactionType {SUBSCRIPTION, PURCHASE}
enum TransactionCategory {TRANSPORT, ENTERTAINMENT,HAZARD,EDUCATION,HEALTH,FOOD_ORDER,OTHER}
type TransactionItem = {
    name: string,
    price: number,
    quantity: number,
    totalPrice: number,
}
type Transaction = {
    transactionId: string;
    shopName: string;
    shopImage: string | null;
    price: number;
    date: string;
    time: string;
    transactionType: TransactionType;
    transactionCategory: TransactionCategory;
    items: TransactionItem[]
    latitude: number;
    longitude: number;
}
interface TransactionDetailModalProps {
    visible: boolean;
    onClose: () => void;
    transaction: Transaction;
}

const TransactionDetailModal = ({ visible, onClose }: TransactionDetailModalProps) => {
    const [showAllItems, setShowAllItems] = React.useState(false);

    const allItems = [
        ["Classic Burger", "1", "18,90 zł"],
        ["Large Fries", "1", "9,50 zł"],
        ["Coca-Cola 0.5L", "1", "7,00 zł"],
        ["Garlic Sauce", "2", "7,00 zł"],
        ["Delivery Fee", "-", "8,99 zł"],
        ["Service Fee", "-", "1,56 zł"],
    ];

    const displayedItems = showAllItems ? allItems : allItems.slice(0, 5);
    const hasMoreItems = allItems.length > 5;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-transparent justify-end">
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#ffffff', '#f2f0ff']}
                        start={{x: 0, y: 0}}
                        end={{x: 0, y: 0.6}}
                        style={styles.gradient}
                    >
                        {/* Header with close button */}
                        <View className={'flex flex-row justify-between bg-transparent items-center mb-4'}>
                            <TouchableOpacity
                                className={'rounded-full items-center justify-center bg-[#ebe9fc] w-14 h-14'}
                                onPress={onClose}
                            >
                                <IconSymbol
                                    name={'xmark'}
                                    size={20}
                                    color="#6b5aed"
                                    weight={'bold'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={'rounded-full items-center justify-center bg-[#ebe9fc] w-14 h-14'}
                            >
                                <IconSymbol
                                    name={'ellipsis'}
                                    size={20}
                                    color="#6b5aed"
                                    weight={'bold'}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            className="flex-1"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 32 }}
                            bounces={true}
                        >
                            {/* Transaction Header */}
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: "timing", duration: 400, delay: 100 }}
                                className="items-center gap-3 py-4 mb-6"
                            >
                                <View
                                    style={{
                                        shadowColor: "#6b5aed",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 12,
                                        elevation: 5,
                                    }}
                                >
                                    <Image
                                        source={require("@/assets/images/ubereats.png")}
                                        className="w-24 h-24 object-contain rounded-[20px]"
                                    />
                                </View>
                                <Text className="font-bold text-2xl text-black">Uber Eats</Text>
                                <Text className="font-bold text-5xl text-[#f87171]">-49,51 zł</Text>
                                <View className="flex flex-row items-center gap-2">
                                    <Text className="text-gray-500 text-base">22 paź</Text>
                                    <View className="w-1 h-1 rounded-full bg-gray-400" />
                                    <Text className="text-gray-500 text-base">19:03</Text>
                                </View>
                                <View className="flex flex-row items-center justify-start gap-2 px-8 py-3 bg-[#72c7aa]/90 rounded-full">
                                    <IconSymbol name={'takeoutbag.and.cup.and.straw'} color={'white'} size={20} style={{opacity:1}}/>
                                    <Text className={'text-white font-bold'}>Food Order</Text>
                                </View>

                            </MotiView>

                            {/* Transaction Receipt */}
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: "timing", duration: 400, delay: 200 }}
                                style={{
                                    shadowColor: "#6b5aed",
                                    shadowOpacity: 0.1,
                                    shadowRadius: 16,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 8,
                                    overflow: 'hidden',
                                }}
                                className="bg-white rounded-3xl p-6 gap-4 mb-4"
                            >
                                <View className="flex flex-row items-center gap-2 mb-2">
                                    <View className="bg-[#ebe9fc] rounded-full p-2">
                                        <IconSymbol name="doc.text" size={16} color="#6b5aed" />
                                    </View>
                                    <Text className="text-sm font-bold text-black">Transaction Receipt</Text>
                                </View>

                                <View className="flex-row justify-between mb-3 pb-2 border-b border-gray-100">
                                    <Text className="text-xs font-bold text-gray-500 flex-1">ITEM</Text>
                                    <Text className="text-xs font-bold text-gray-500 w-12 text-center">QTY</Text>
                                    <Text className="text-xs font-bold text-gray-500 w-20 text-right">AMOUNT</Text>
                                </View>

                                <View className="gap-2 relative">
                                    {displayedItems.map(([item, qty, price], index) => (
                                        <View key={item} className="flex-row justify-between py-2">
                                            <Text className="text-sm text-gray-800 flex-1 font-medium">{item}</Text>
                                            <Text className="text-sm text-gray-600 w-12 text-center">{qty}</Text>
                                            <Text className="text-sm text-black font-semibold w-20 text-right">{price}</Text>
                                        </View>
                                    ))}
                                    {hasMoreItems && !showAllItems && (
                                        <View className="absolute -bottom-4 left-0 right-0">
                                            <LinearGradient
                                                colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 1)']}
                                                start={{x: 0, y: 0}}
                                                end={{x: 0, y: 1}}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: -24,
                                                    right: -24,
                                                    height: 80,
                                                }}
                                            />
                                            <View className="">
                                                <TouchableOpacity
                                                    onPress={() => setShowAllItems(true)}
                                                    className="bg-white rounded-full py-3 px-6 self-center"
                                                >
                                                    <View className="flex-row items-center gap-2">
                                                        <Text className="text-[#6b5aed] font-semibold text-sm">Show more</Text>
                                                        <IconSymbol name="chevron.down" size={14} color="#6b5aed" weight="bold" />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </MotiView>

                            {/* MAP VIEW */}
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: "timing", duration: 400, delay: 300 }}
                                className="w-full rounded-3xl bg-white overflow-hidden"
                                style={{
                                    shadowColor: "#6b5aed",
                                    shadowOpacity: 0.1,
                                    shadowRadius: 16,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 8,
                                }}
                            >
                                <MapView
                                    style={{ height: 200, width: "100%" }}
                                    pointerEvents="none"
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    rotateEnabled={false}
                                    pitchEnabled={false}
                                    initialRegion={{
                                        latitude: 37.78825,
                                        longitude: -122.4324,
                                        latitudeDelta: 0.0922,
                                        longitudeDelta: 0.0421,
                                    }}
                                />
                                <View className="w-full bg-white px-4 py-4">
                                    <View className="flex flex-row items-center gap-2">
                                        <IconSymbol name="location.fill" size={18} color="#6b5aed" />
                                        <View>
                                            <Text className="text-black font-bold text-sm">Location</Text>
                                            <Text className="text-gray-600 text-xs mt-0.5">San Francisco, CA</Text>
                                        </View>
                                    </View>
                                </View>
                            </MotiView>
                        </ScrollView>

                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        height: '95%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        padding: 20,
        paddingTop: 16,
    }
});

export default TransactionDetailModal;
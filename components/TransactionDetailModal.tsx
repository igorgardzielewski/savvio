import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from '@/components/ui/Text';
import { getLogoSource } from "@/helpers/imageHelpers";
import { getShopIcon } from "@/helpers/shopCategoryHelpers";
import { formatDateLong, formatTime } from "@/helpers/timeHelper";
import { Transaction } from "@/types";
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { MotiView } from "moti";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SFSymbols6_0 } from "sf-symbols-typescript";
interface TransactionDetailModalProps {
    visible: boolean;
    onClose: () => void;
    onDelete: (transactionId: number) => Promise<boolean | undefined>;
    transaction: Transaction | null;
}

const convertUnit = (unit: string) => {
    switch (unit) {
        case 'PIECES':
            return 'pcs';
        case 'KG':
            return 'kg';
        case 'ML':
            return 'ml';
        case 'L':
            return 'l';
        default:
            return 'pcs';
    }
}
const TransactionDetailModal = ({ visible, onClose, transaction, onDelete }: TransactionDetailModalProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [showAllItems, setShowAllItems] = React.useState(false);
    const receiptData = transaction?.receiptPositions || [];
    const displayedItems = showAllItems ? receiptData : receiptData.slice(0, 5);
    const hasMoreItems = receiptData.length > 5;
    const [settingsExpanded, setSettingsExpanded] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletePending, setDeletePending] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const handleEditTransaction = () => {
        router.push({
            pathname: '/(addexpense)/ManuallyAdd',
            params: {
                transactionData: JSON.stringify(transaction),
            }
        });
        onClose();
    }
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
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 0.6 }}
                        style={styles.gradient}
                    >
                        <View className={'flex flex-row justify-between bg-transparent items-center mb-4'}>
                            <TouchableOpacity
                                className={'rounded-full items-center justify-center bg-[#ebe9fc] w-16 h-16 p-2'}
                                onPress={onClose}
                            >
                                <IconSymbol
                                    name={'xmark'}
                                    size={24}
                                    color="#6b5aed"
                                    weight={'bold'}
                                />
                            </TouchableOpacity>
                            <View className={`bg-[#ebe9fc] ${settingsExpanded ? 'items-end' : 'w-16 justify-center'} p-2 h-16 rounded-full items-center  flex flex-row`}>
                                {settingsExpanded &&
                                    <View className={'mr-2 flex flex-row items-center'}>
                                        {transaction?.type != 'SUBSCRIPTION' &&
                                            <TouchableOpacity
                                                className={'w-14 h-14 justify-center items-center mr-2'}
                                                onPress={handleEditTransaction}
                                            >
                                                <IconSymbol
                                                    name={'square.and.pencil'}
                                                    size={24}
                                                    color="#6b5aed"
                                                    weight={'bold'}
                                                />
                                            </TouchableOpacity>
                                        }
                                        <TouchableOpacity
                                            className={'w-14 h-14 justify-center items-center'}
                                            onPress={() => setDeleteModalVisible(true)}
                                        >
                                            <IconSymbol
                                                name={'trash'}
                                                size={24}
                                                color="#6b5aed"
                                                weight={'bold'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                }
                                <TouchableOpacity
                                    onPress={() => setSettingsExpanded(!settingsExpanded)}
                                    className={`${settingsExpanded ? 'w-14 h-14 bg-white rounded-full justify-center items-center' : ''}`}
                                >
                                    <IconSymbol
                                        name={'ellipsis'}
                                        size={24}
                                        color="#6b5aed"
                                        weight={'bold'}
                                    />
                                </TouchableOpacity>
                            </View>
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
                                    {transaction?.shop.logoUrl ?
                                        <Image
                                            source={getLogoSource(transaction?.shop.logoUrl)}
                                            className="w-24 h-24 object-contain rounded-[20px]"
                                        /> :
                                        <View className="w-24 h-24 object-contain rounded-[20px] bg-white items-center justify-center">
                                            <IconSymbol name={'cart'} color={'black'} size={64} />
                                        </View>
                                    }

                                </View>
                                <Text className="font-bold text-2xl text-black">{transaction?.shop.name}</Text>
                                <Text className="font-bold text-5xl text-[#f87171]">{transaction?.amount.toFixed(2)}zł</Text>
                                <View className="flex flex-row items-center gap-2">
                                    {transaction?.date && <Text className="text-gray-500 text-base">{formatDateLong(transaction?.date.toString())}</Text>}
                                    <View className="w-1 h-1 rounded-full bg-gray-400" />
                                    {transaction?.time && <Text className="text-gray-500 text-base">{formatTime(transaction.time)}</Text>}
                                </View>
                                <View className={'flex flex-row items-center justify-center gap-4 w-full'}>
                                    {transaction?.budgetCategory &&
                                        <View className="flex flex-row items-center justify-start gap-2 px-8 py-3 rounded-full"
                                            style={{ backgroundColor: transaction.budgetCategory.color }}
                                        >
                                            <IconSymbol name={transaction.budgetCategory.iconUri as SFSymbols6_0} color={'white'} size={20} style={{ opacity: 1 }} />
                                            <Text className={'text-white font-bold'}>{transaction.budgetCategory.name}</Text>
                                        </View>}
                                    <View className="flex flex-row items-center justify-start gap-2 px-8 py-3 0 rounded-full" style={{ backgroundColor: transaction?.shop.categoryColor || '#72c7aa' }}>
                                        {transaction?.shop.categoryName && <IconSymbol name={getShopIcon(transaction?.shop.categoryName) as SFSymbols6_0} color={'white'} size={20} style={{ opacity: 1 }} />}
                                        {transaction?.shop.categoryName && <Text className={'text-white font-bold'}>{transaction?.shop.categoryName}</Text>}
                                    </View>
                                </View>
                            </MotiView>
                            {displayedItems.length > 0 &&
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

                                    <View className="flex-row mb-3 pb-2 border-b border-gray-100">
                                        <Text className="text-xs font-bold text-gray-500" style={{ width: '56%' }}>ITEM</Text>
                                        <Text className="text-xs font-bold text-gray-500 text-center" style={{ width: '12%' }}>QTY</Text>
                                        <Text className="text-xs font-bold text-gray-500 text-center" style={{ width: '12%' }}>UNIT</Text>
                                        <Text className="text-xs font-bold text-gray-500 text-right" style={{ width: '20%' }}>AMOUNT</Text>
                                    </View>

                                    <View className="gap-2 relative">
                                        {displayedItems.map((position) => (
                                            <View key={`${position.id}-${position.name}`} className="flex-row py-2">
                                                <Text className="text-sm text-gray-800 font-medium" style={{ width: '56%' }} numberOfLines={1}>
                                                    {position.name}
                                                </Text>
                                                <Text className="text-sm text-gray-600 text-center" style={{ width: '12%' }}>
                                                    {position.quantity}
                                                </Text>
                                                <Text className="text-sm text-gray-600 text-center" style={{ width: '12%' }}>
                                                    {convertUnit(position.unit)}
                                                </Text>
                                                <Text className="text-sm text-black font-semibold text-right" style={{ width: '20%' }}>
                                                    {position.totalItemPrice.toFixed(2)}zł
                                                </Text>
                                            </View>
                                        ))}
                                        {hasMoreItems && !showAllItems && (
                                            <View className="absolute -bottom-4 left-0 right-0">
                                                <LinearGradient
                                                    colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 1)']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 0, y: 1 }}
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
                                </MotiView>}

                            {/* MAP VIEW */}
                            {/*<MotiView*/}
                            {/*    from={{ opacity: 0, translateY: 20 }}*/}
                            {/*    animate={{ opacity: 1, translateY: 0 }}*/}
                            {/*    transition={{ type: "timing", duration: 400, delay: 300 }}*/}
                            {/*    className="w-full rounded-3xl bg-white overflow-hidden"*/}
                            {/*    style={{*/}
                            {/*        shadowColor: "#6b5aed",*/}
                            {/*        shadowOpacity: 0.1,*/}
                            {/*        shadowRadius: 16,*/}
                            {/*        shadowOffset: { width: 0, height: 4 },*/}
                            {/*        elevation: 8,*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    <MapView*/}
                            {/*        style={{ height: 200, width: "100%" }}*/}
                            {/*        pointerEvents="none"*/}
                            {/*        scrollEnabled={false}*/}
                            {/*        zoomEnabled={false}*/}
                            {/*        rotateEnabled={false}*/}
                            {/*        pitchEnabled={false}*/}
                            {/*        initialRegion={{*/}
                            {/*            latitude: 37.78825,*/}
                            {/*            longitude: -122.4324,*/}
                            {/*            latitudeDelta: 0.0922,*/}
                            {/*            longitudeDelta: 0.0421,*/}
                            {/*        }}*/}
                            {/*    />*/}
                            {/*    <View className="w-full bg-white px-4 py-4">*/}
                            {/*        <View className="flex flex-row items-center gap-2">*/}
                            {/*            <IconSymbol name="location.fill" size={18} color="#6b5aed" />*/}
                            {/*            <View>*/}
                            {/*                <Text className="text-black font-bold text-sm">Location</Text>*/}
                            {/*                <Text className="text-gray-600 text-xs mt-0.5">San Francisco, CA</Text>*/}
                            {/*            </View>*/}
                            {/*        </View>*/}
                            {/*    </View>*/}
                            {/*</MotiView>*/}
                        </ScrollView>

                    </LinearGradient>
                </View>
            </View>
            <Modal
                visible={deleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
                        <View style={{ flex: 1 }} />
                    </TouchableWithoutFeedback>

                    <SafeAreaView edges={['bottom']}>
                        <View style={{ margin: 8, backgroundColor: 'white', borderRadius: 40, paddingBottom: 24, paddingTop: 24, paddingHorizontal: 24 }}>
                            <View style={{ minHeight: 200, justifyContent: deletePending ? 'center' : 'space-between' }}>
                                {deletePending ? <ActivityIndicator size="large" color="#6b5aed" /> : <>
                                    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                        <Text className="text-xl font-bold text-black mb-2">Delete Transaction?</Text>
                                        {deleteError ? <Text className="text-red-500 text-center">{deleteError}</Text> : <Text className="text-gray-500 text-center">This action cannot be undone</Text>}
                                    </View>

                                    <View style={{ gap: 12 }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setDeletePending(true);
                                                setDeleteError('');
                                                onDelete(transaction?.id || 0).then(
                                                    (res) => {
                                                        if (res) {
                                                            setDeleteModalVisible(false)
                                                            setTimeout(() => onClose(), 100);
                                                        }
                                                        else setDeleteError('Failed to delete transaction. Please try again.');
                                                    }
                                                ).finally(() => setDeletePending(false));
                                            }}
                                            className="bg-danger rounded-full py-[14px] align-middle"
                                        >
                                            <Text className="text-white font-bold text-lg text-center">Delete</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => setDeleteModalVisible(false)}
                                            className="bg-[#ebe9fc] rounded-full py-[14px] align-middle"
                                        >
                                            <Text className="font-bold text-lg text-accent text-center">Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>}
                            </View>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
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
import { Text } from '@/components/ui/Text';
import { getLogoSource } from "@/helpers/imageHelpers";
import { formatDate, formatTime } from "@/helpers/timeHelper";
import { Transaction } from "@/types";
import React from "react";
import {
    Image,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface LastTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    transaction?: Transaction | null;
}

export default function LastTransactionModal({
    visible,
    onClose,
    transaction,
}: LastTransactionModalProps) {
    if (!transaction || !transaction.receiptPositions || transaction.receiptPositions.length === 0) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/40 justify-center items-center">
                    <TouchableWithoutFeedback>
                        <View className="w-[80%] max-h-[85%]">
                            <View className="items-center mb-[-32px] z-10">
                                <View
                                    style={{
                                        shadowColor: "#000",
                                        shadowOpacity: 0.2,
                                        shadowRadius: 8,
                                        shadowOffset: { width: 0, height: 4 },
                                        elevation: 8,
                                    }}
                                    className="bg-white rounded-2xl overflow-hidden"
                                >
                                    <Image
                                        source={getLogoSource(transaction.shop.logoUrl)}
                                        className="w-16 h-16 object-contain rounded-[12px]"
                                    />
                                </View>
                            </View>

                            <View
                                style={{
                                    shadowColor: "#000",
                                    shadowOpacity: 0.3,
                                    shadowRadius: 16,
                                    shadowOffset: { width: 0, height: 8 },
                                    elevation: 10,
                                }}
                                className="bg-white rounded-t-3xl pt-12 px-6 pb-6"
                            >
                                <View className="items-center mb-1">
                                    <Text
                                        className="text-2xl font-bold text-black"
                                        style={{ letterSpacing: 1.5 }}
                                    >
                                        {transaction.shop.name.toUpperCase()}
                                    </Text>
                                    <Text className="text-[10px] text-gray-500 mt-0.5">
                                        Transaction Receipt
                                    </Text>
                                </View>

                                <View className="h-[1px] bg-gray-300 my-3" />

                                <View className="mb-3 gap-0.5">
                                    <View className="flex-row justify-between">
                                        <Text className="text-xs text-gray-500">Date:</Text>
                                        <Text className="text-xs text-black font-semibold">{formatDate(transaction.date)}</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-xs text-gray-500">Time:</Text>
                                        <Text className="text-xs text-black font-semibold">{formatTime(transaction.time)}</Text>
                                    </View>
                                </View>

                                <View className="h-[1px] bg-gray-300 my-3" />

                                <View className="flex-row justify-between mb-2 pb-1 border-b border-gray-200">
                                    <Text className="text-xs font-bold text-gray-600 flex-1">ITEM</Text>
                                    <Text className="text-xs font-bold text-gray-600 w-10 text-center">QTY</Text>
                                    <Text className="text-xs font-bold text-gray-600 w-20 text-right">AMOUNT</Text>
                                </View>

                                <ScrollView className="max-h-[200px]" showsVerticalScrollIndicator={false}>
                                    {transaction.receiptPositions.map((item, index) => (
                                        <View key={item.id || index} className="flex-row justify-between py-1.5">
                                            <Text className="text-sm text-gray-800 flex-1" numberOfLines={1}>{item.name}</Text>
                                            <Text className="text-sm text-gray-600 w-10 text-center">{item.quantity}</Text>
                                            <Text className="text-sm text-black w-20 text-right">{item.totalItemPrice.toFixed(2)} zł</Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                <View className="h-[1px] bg-gray-400 my-3" />

                                <View className="flex-row justify-between items-center">
                                    <Text className="text-lg font-bold text-black">TOTAL:</Text>
                                    <Text className="text-2xl font-bold text-[#f87171]">-{transaction.amount.toFixed(2)} zł</Text>
                                </View>

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
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
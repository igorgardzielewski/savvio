import React from "react";
import {
    View,
    Modal,
    TouchableWithoutFeedback,
    ScrollView, Image,
} from "react-native";
import {Text} from '@/components/ui/Text'

interface LastTransactionModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function LastTransactionModal({
                                                 visible,
                                                 onClose,
                                             }: LastTransactionModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Overlay */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/40 justify-center items-center">
                    {/* Modal */}
                    <TouchableWithoutFeedback>
                        <View className="w-[80%] max-h-[85%]">
                            {/* Logo - positioned above modal */}
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
                                        source={require('@/assets/images/ubereats.png')}
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
                                {/* Merchant Header */}
                                <View className="items-center mb-1">
                                    <Text
                                        className="text-2xl font-bold text-black"
                                        style={{ letterSpacing: 1.5 }}
                                    >
                                        UBER EATS
                                    </Text>
                                    <Text className="text-[10px] text-gray-500 mt-0.5">
                                        Transaction Receipt
                                    </Text>
                                </View>

                                <View className="h-[1px] bg-gray-300 my-3" />

                                {/* Transaction Info */}
                                <View className="mb-3 gap-0.5">
                                    <View className="flex-row justify-between">
                                        <Text className="text-xs text-gray-500">Date:</Text>
                                        <Text className="text-xs text-black font-semibold">25.10.2025</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-xs text-gray-500">Time:</Text>
                                        <Text className="text-xs text-black font-semibold">10:22</Text>
                                    </View>
                                </View>

                                <View className="h-[1px] bg-gray-300 my-3" />

                                {/* Items Header */}
                                <View className="flex-row justify-between mb-2 pb-1 border-b border-gray-200">
                                    <Text className="text-xs font-bold text-gray-600 flex-1">ITEM</Text>
                                    <Text className="text-xs font-bold text-gray-600 w-10 text-center">QTY</Text>
                                    <Text className="text-xs font-bold text-gray-600 w-20 text-right">AMOUNT</Text>
                                </View>

                                {/* Items */}
                                <ScrollView className="max-h-[200px]" showsVerticalScrollIndicator={false}>
                                    <View className="flex-row justify-between py-1.5">
                                        <Text className="text-sm text-gray-800 flex-1">Classic Burger</Text>
                                        <Text className="text-sm text-gray-600 w-10 text-center">1</Text>
                                        <Text className="text-sm text-black w-20 text-right">18,90 zł</Text>
                                    </View>
                                    <View className="flex-row justify-between py-1.5">
                                        <Text className="text-sm text-gray-800 flex-1">Large Fries</Text>
                                        <Text className="text-sm text-gray-600 w-10 text-center">1</Text>
                                        <Text className="text-sm text-black w-20 text-right">9,50 zł</Text>
                                    </View>
                                    <View className="flex-row justify-between py-1.5">
                                        <Text className="text-sm text-gray-800 flex-1">Coca-Cola 0.5L</Text>
                                        <Text className="text-sm text-gray-600 w-10 text-center">1</Text>
                                        <Text className="text-sm text-black w-20 text-right">7,00 zł</Text>
                                    </View>
                                    <View className="flex-row justify-between py-1.5">
                                        <Text className="text-sm text-gray-800 flex-1">Garlic Sauce</Text>
                                        <Text className="text-sm text-gray-600 w-10 text-center">2</Text>
                                        <Text className="text-sm text-black w-20 text-right">7,00 zł</Text>
                                    </View>
                                    <View className="flex-row justify-between py-1.5">
                                        <Text className="text-sm text-gray-800 flex-1">Delivery Fee</Text>
                                        <Text className="text-sm text-gray-600 w-10 text-center">-</Text>
                                        <Text className="text-sm text-black w-20 text-right">8,99 zł</Text>
                                    </View>
                                    <View className="flex-row justify-between py-1.5">
                                        <Text className="text-sm text-gray-800 flex-1">Service Fee</Text>
                                        <Text className="text-sm text-gray-600 w-10 text-center">-</Text>
                                        <Text className="text-sm text-black w-20 text-right">1,56 zł</Text>
                                    </View>
                                </ScrollView>

                                <View className="h-[1px] bg-gray-400 my-3" />

                                {/* Total */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-lg font-bold text-black">TOTAL:</Text>
                                    <Text className="text-2xl font-bold text-[#f87171]">-49,45 zł</Text>
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
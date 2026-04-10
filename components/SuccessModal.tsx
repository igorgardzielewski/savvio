import { Text } from "@/components/ui/Text";
import { useAuthStore } from "@/store/authStore";
import React from "react";
import { ActivityIndicator, Modal, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "./ui/icon-symbol";
interface DeleteModalProps {
    visible: boolean;
    onClose: () => void;
    loading: boolean;
}
export default function DeleteModal({ visible, onClose, loading }: DeleteModalProps) {
    const { token } = useAuthStore();
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <SafeAreaView edges={['bottom']}>
                    <View style={{ margin: 8, backgroundColor: 'white', borderRadius: 40, paddingBottom: 24, paddingTop: 24, paddingHorizontal: 24 }}>
                        <View style={{ minHeight: 200, justifyContent: 'center' }}>
                            {loading ? <View className="flex items-center gap-4">
                                <ActivityIndicator size="large" color="#6B5AED" />
                                <Text className="font-medium text-lg text-accent text-center">Processing</Text>
                            </View> : <>
                                <View className="flex items-center gap-4">
                                    <IconSymbol
                                        name={'checkmark.circle.fill'}
                                        size={128}
                                        color="#10b981"
                                        weight={'bold'}
                                    />
                                    <Text className="font-bold text-lg text-accent text-center">You successfully bought subscription!</Text>
                                </View>
                                <View className="flex mt-4">
                                    <TouchableOpacity
                                        onPress={() => { onClose() }}
                                        className="bg-[#ebe9fc] rounded-full py-[14px] align-middle"
                                    >
                                        <Text className="font-medium text-lg text-accent text-center">Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </>}
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    )
}
import { Text } from "@/components/ui/Text";
import { useRouter } from "expo-router";
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface DeleteModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'ocr' | 'chat'
}
export default function DeleteModal({ visible, onClose, type }: DeleteModalProps) {
    const router = useRouter();
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
                            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                <Text className="text-xl font-bold text-black mb-2">Hi, there!</Text>
                                <Text className="text-lg text-black mb-2 text-center font-medium">Unluckily, you have reached your daily limit of {type === 'ocr' ? 'OCR' : 'Chat'}. Usage will be reset tomorrow.</Text>
                                <Text className="text-lg text-black mb-2 text-center font-medium">You can upgrade your plan in your profile to get <Text className="font-bold">unlimited usage just for 1.25$</Text>.</Text>
                            </View>
                            <View style={{ gap: 12 }}>
                                <TouchableOpacity
                                    onPress={() => { router.push('/(profile)'); onClose() }}
                                    className="bg-[#6b5aed] rounded-full py-[14px] align-middle"
                                >
                                    <Text className="font-bold text-lg text-white text-center">Upgrade</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => { router.back(); onClose() }}
                                    className="bg-[#ebe9fc] rounded-full py-[14px] align-middle"
                                >
                                    <Text className="font-bold text-lg text-accent text-center">Back</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    )
}
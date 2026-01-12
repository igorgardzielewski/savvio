import { Text } from "@/components/ui/Text";
import { useAuthStore } from "@/store/authStore";
import * as Linking from 'expo-linking';
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface DeleteModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'manage' | 'upgrade';
}
export default function DeleteModal({ visible, onClose, type }: DeleteModalProps) {
    const { token } = useAuthStore();
    const handleUpgrade = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/stripe/create-checkout-session?price_id=price_1Smkbm1Rh9KeiLVS3K0TLhkM`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Stripe error:', response.status);
                return;
            }

            const data = await response.json();
            if (data.url) {
                Linking.openURL(data.url);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleManageSubscription = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/stripe/create-portal-session`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            Linking.openURL(data.url);
        } catch (error) {
            console.error('Error:', error);
        }
    };
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
                                {type === 'upgrade' ? (
                                    <>
                                        <Text className="text-xl font-bold text-black mb-2">Unlock unlimited usage of OCR & Chat</Text>
                                        <Text className="text-lg text-black mb-2 text-center font-medium">Just for <Text className="font-bold">1.25$</Text> per month</Text>
                                        <Text className="text-lg text-black mb-2 text-center font-medium">By clicking Proceed will make you redirect to Stripe checkout, you also agree to our <Text className="font-bold">Terms of Service</Text> and <Text className="font-bold">Privacy Policy</Text></Text>
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-xl font-bold text-black mb-2">Manage your subscription</Text>
                                        <Text className="text-lg text-black mb-2 text-center font-medium">You can manage your subscription and cancel it if you want by clicking on Manage button</Text>
                                    </>
                                )}
                            </View>
                            <View style={{ gap: 12 }}>
                                <TouchableOpacity
                                    onPress={() => { type === 'upgrade' ? handleUpgrade() : handleManageSubscription() }}
                                    className="bg-[#6b5aed] rounded-full py-[14px] align-middle"
                                >
                                    <Text className="font-bold text-lg text-white text-center">{type === 'upgrade' ? 'Upgrade' : 'Manage'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => { onClose() }}
                                    className="bg-[#ebe9fc] rounded-full py-[14px] align-middle"
                                >
                                    <Text className="font-bold text-lg text-accent text-center">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    )
}
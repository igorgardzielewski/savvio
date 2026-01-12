import { Text } from "@/components/ui/Text";
import { getLogoSource } from "@/helpers/imageHelpers";
import { useAuthStore } from "@/store/authStore";
import { Subscription } from "@/types";
import { Image } from 'expo-image';
import React from "react";
import { ActivityIndicator, Modal, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DeleteSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    subscription: Subscription | null;
    onDeleteSuccess: (subscription: Subscription) => void;
}

export default function DeleteSubscriptionModal({ visible, onClose, subscription, onDeleteSuccess }: DeleteSubscriptionModalProps) {
    const [deletePending, setDeletePending] = React.useState(false);
    const [deleteError, setDeleteError] = React.useState('');
    const { token } = useAuthStore();

    const handleDelete = async () => {
        if (!subscription) return;

        setDeleteError('');
        setDeletePending(true);

        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/subscriptions/${subscription.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const { cancelSubscriptionNotifications } = await import('@/helpers/notificationHelpers');
                await cancelSubscriptionNotifications(subscription.id);

                onDeleteSuccess(subscription);
                onClose();
            } else {
                setDeleteError('Failed to delete subscription. Please try again.');
            }
        } catch (err: any) {
            setDeleteError(err.message || 'An error occurred');
        } finally {
            setDeletePending(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => onClose()}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <TouchableWithoutFeedback onPress={() => onClose()}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>

                <SafeAreaView edges={['bottom']}>
                    <View style={{ margin: 8, backgroundColor: 'white', borderRadius: 40, paddingBottom: 24, paddingTop: 24, paddingHorizontal: 24 }}>
                        <View style={{ minHeight: 200, justifyContent: deletePending ? 'center' : 'space-between' }}>
                            {deletePending ? <ActivityIndicator size="large" color="#6b5aed" /> :
                                <>
                                    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                        <Text className="text-xl font-bold text-black mb-2">Delete this subscription?</Text>
                                        {deleteError ? <Text className="text-red-500 text-center">{deleteError}</Text> : <Text className="text-gray-500 text-center">This action cannot be undone</Text>}
                                    </View>

                                    {subscription && (
                                        <View
                                            className="relative flex flex-row justify-between items-center rounded-[24px] p-4 overflow-hidden shadow-sm self-center mb-4"
                                            style={{
                                                backgroundColor: subscription.color,
                                                width: '100%',
                                                minHeight: 80
                                            }}
                                        >
                                            <View className="flex flex-col gap-1">
                                                <Text className="text-white font-bold text-xl">
                                                    {subscription.shop.name}
                                                </Text>
                                                <Text className="text-white/70 text-sm">
                                                    {parseFloat(subscription.price).toFixed(2)} zł / {subscription.period === 'MONTHLY' ? 'month' : subscription.period === 'YEARLY' ? 'year' : 'one-time'}
                                                </Text>
                                            </View>

                                            <View className="bg-white p-2 rounded-full items-center justify-center">
                                                <View className="bg-white rounded-full items-center justify-center overflow-hidden" style={{ width: 48, height: 48 }}>
                                                    <Image
                                                        source={getLogoSource(subscription.shop.logoUrl)}
                                                        style={{ width: 48, height: 48 }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    <View style={{ gap: 12 }}>
                                        <TouchableOpacity
                                            onPress={handleDelete}
                                            className="bg-danger rounded-full py-[14px] align-middle"
                                        >
                                            <Text className="text-white font-bold text-lg text-center">Delete</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => onClose()}
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
    )
}

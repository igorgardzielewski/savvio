import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/Text";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DeleteAccountModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
    const [deletePending, setDeletePending] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { token, logout } = useAuthStore();
    const { clearUser } = useUserStore();
    const router = useRouter();

    useEffect(() => {
        if (password) {
            setDeleteError('');
        }
    }, [password]);

    useEffect(() => {
        if (!visible) {
            setPassword('');
            setDeleteError('');
            setShowPassword(false);
        }
    }, [visible]);

    const handleDelete = async () => {
        if (!password) {
            setDeleteError('Please enter your password');
            return;
        }

        setDeleteError('');
        setDeletePending(true);

        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ password: password.trim() }),
            });

            if (res.ok) {
                onClose();
                clearUser();
                logout();
                router.replace('/(auth)/authPage');
            } else {
                const data = await res.json().catch(() => null);
                setDeleteError(data?.message || 'Failed to delete account. Please try again.');
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
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <TouchableWithoutFeedback onPress={() => onClose()}>
                        <View style={{ flex: 1 }} />
                    </TouchableWithoutFeedback>

                    <SafeAreaView edges={['bottom']}>
                        <View style={{ margin: 8, backgroundColor: 'white', borderRadius: 40, paddingBottom: 24, paddingTop: 24, paddingHorizontal: 24 }}>
                            <View style={{ minHeight: 280, justifyContent: deletePending ? 'center' : 'space-between' }}>
                                {deletePending ? <ActivityIndicator size="large" color="#6b5aed" /> :
                                    <>
                                        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                                            <View className="bg-red-100 p-4 rounded-full mb-4">
                                                <IconSymbol name="exclamationmark.triangle.fill" size={40} color="#EF4444" />
                                            </View>
                                            <Text className="text-xl font-bold text-black mb-2">Delete your account?</Text>
                                            <Text className="text-gray-500 text-center px-4">
                                                This action is permanent and cannot be undone. All your data will be deleted.
                                            </Text>
                                        </View>

                                        <View className="mb-4">
                                            <Text className="text-gray-700 font-medium mb-2">Enter your password to confirm</Text>
                                            <View className="flex flex-row items-center w-full border border-gray-300 rounded-2xl bg-gray-50">
                                                <TextInput
                                                    value={password}
                                                    onChangeText={setPassword}
                                                    placeholder="Password"
                                                    secureTextEntry={!showPassword}
                                                    className="text-black font-normal flex-1 text-[18px] py-4 px-4"
                                                />
                                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-4">
                                                    <IconSymbol name={showPassword ? "eye.slash" : "eye"} size={20} color="#6B7280" />
                                                </TouchableOpacity>
                                            </View>
                                            {deleteError && <Text className="text-red-500 text-left font-medium text-[14px] mt-2">{deleteError}</Text>}
                                        </View>

                                        <View style={{ gap: 12 }}>
                                            <TouchableOpacity
                                                onPress={handleDelete}
                                                className="bg-danger rounded-full py-[14px] align-middle"
                                            >
                                                <Text className="text-white font-bold text-lg text-center">Delete Account</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => onClose()}
                                                className="bg-[#ebe9fc] rounded-full py-[14px] align-middle"
                                            >
                                                <Text className="font-bold text-lg text-accent text-center">Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                }
                            </View>
                        </View>
                    </SafeAreaView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

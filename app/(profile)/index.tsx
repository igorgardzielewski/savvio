import DeleteAccountModal from "@/components/DeleteAccountModal";
import SubscriptionProceedModal from "@/components/SubscriptionProceedModal";
import SuccessModal from "@/components/SuccessModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/Text";
import { getInitials } from "@/helpers/stringHelpers";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const styles = StyleSheet.create({
    heading: { color: '#414054', fontSize: 18, fontWeight: '600' },
    headingMeta: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
    amount: { color: '#F87171', fontSize: 36, fontWeight: '700' },
    amountMeta: { color: '#374151', fontSize: 16, fontWeight: '600' },
    accent: { color: '#6B5AED' },
    gradient: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 100,
        gap: 24,
        // optional: borderRadius: 20,
    },
});
export default function ProfileScreen() {
    const { user } = useUserStore()
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [edit, setEdit] = useState<{ [key: string]: boolean }>({});
    const { updateFirstName, updateLastName, updatePremium, updatePremiumUntil } = useUserStore()
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { token } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [loadingPassword, setLoadingPassword] = useState(false)
    const [error, setError] = useState('')
    const [errorOldPassword, setErrorOldPassword] = useState('')
    const [errorNewPassword, setErrorNewPassword] = useState('')
    const [errorConfirmPassword, setErrorConfirmPassword] = useState('')
    const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false)
    const [subscriptionProceedModalVisible, setSubscriptionProceedModalVisible] = useState(false)
    const [subscriptionProceedModalType, setSubscriptionProceedModalType] = useState<'manage' | 'upgrade'>('upgrade')
    const { payment } = useLocalSearchParams<{ payment?: string }>();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successLoading, setSuccessLoading] = useState(false)
    const fetchSubscription = async () => {
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/stripe/subscription`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (res.ok) {
                if (data.status === 'active') {
                    updatePremium(data.status === 'active')
                    updatePremiumUntil(data.currentPeriodEnd);
                }
            }
        }
        catch (e) {
            console.log(e)
        }
        finally {
            setSuccessLoading(false)
        }
    }
    useEffect(() => {
        if (payment === 'success') {
            if (subscriptionProceedModalVisible) {
                setSubscriptionProceedModalVisible(false)
            }
            setSuccessLoading(true)
            setShowSuccessModal(true);
            setTimeout(() => fetchSubscription(), 1500);
            router.replace('/(profile)');
        }
    }, [payment]);

    const changeFirstLastName = async () => {
        if (!firstName && !lastName) {
            setError('Please fill in at least one field')
            return
        }
        const body = {
            firstName: firstName.trim() || null,
            lastName: lastName.trim() || null,
        }
        try {
            setLoading(true)
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/name`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })
            const data = await response.json()
            if (response.ok) {
                updateFirstName(data.firstName)
                updateLastName(data.lastName)
                setEdit({ ...edit, fullName: false })
            }
            else {
                setError('Failed to update name. Please try again.')
            }
        }
        catch (e) {
            setError('Failed to update name. Please try again.')
        }
        finally {
            setLoading(false)
        }
    };
    useEffect(() => {
        if (firstName || lastName) {
            setError('')
        }
    }, [firstName, lastName])
    useEffect(() => {
        console.log(user?.premiumUntil)
    }, [user?.premiumUntil])
    const changePassword = async () => {
        setErrorOldPassword('')
        setErrorNewPassword('')
        setErrorConfirmPassword('')

        if (!password || !newPassword || !confirmNewPassword) {
            if (!password) setErrorOldPassword('Please enter current password')
            if (!newPassword) setErrorNewPassword('Please enter new password')
            if (!confirmNewPassword) setErrorConfirmPassword('Please confirm new password')
            return
        }
        if (newPassword.length < 8) {
            setErrorNewPassword('Password must be at least 8 characters')
            return
        }
        const digitCount = (newPassword.match(/\d/g) || []).length
        if (digitCount < 3) {
            setErrorNewPassword('Password must contain at least 3 digits')
            return
        }
        if (newPassword !== confirmNewPassword) {
            setErrorConfirmPassword('Passwords do not match')
            return
        }
        const body = {
            oldPassword: password.trim() || null,
            newPassword: newPassword.trim() || null,
        }
        try {
            setLoadingPassword(true)
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })

            if (response.ok) {
                setEdit({ ...edit, password: false })
                setPassword('')
                setNewPassword('')
                setConfirmNewPassword('')
            }
            else {
                const data = await response.json().catch(() => null)
                if (data?.field === 'oldPassword') {
                    setErrorOldPassword(data.message)
                } else if (data?.field === 'newPassword') {
                    setErrorNewPassword(data.message)
                } else {
                    setErrorNewPassword(data?.message || 'Failed to update password')
                }
            }
        }
        catch (e) {
            setErrorNewPassword('Failed to update password. Please try again.')
        }
        finally {
            setLoadingPassword(false)
        }
    };
    useEffect(() => {
        if (password) setErrorOldPassword('')
    }, [password])
    useEffect(() => {
        if (newPassword) setErrorNewPassword('')
    }, [newPassword])
    useEffect(() => {
        if (confirmNewPassword) setErrorConfirmPassword('')
    }, [confirmNewPassword])
    return (
        <LinearGradient
            colors={['#F9FBFF', '#F9FBFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.4 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView
                className="flex-1"
                edges={['top', 'left', 'right']}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingBottom: 100,
                        gap: 24,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center justify-start gap-4">
                        <View className="flex flex-row items-center justify-between w-full">
                            <Pressable onPress={() => router.push('/(tabs)')} className="p-2 bg-white rounded-full">
                                <View className="rounded-full p-2 flex items-center justify-center">
                                    <IconSymbol name="arrow.left" size={28} color="#6b5aed" />
                                </View>
                            </Pressable>
                        </View>
                        <View
                            style={{
                                width: 128,
                                height: 128,
                                borderRadius: 9999,
                                borderColor: user?.premium ? '#6b5aed' : '#9CA3AF',
                                borderWidth: 2,
                                backgroundColor: user?.premium ? '#e0e7ff' : '#D1D5DB',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text className={` ${user?.premium ? 'text-[#6b5aed]' : 'text-[#6B7280]'} font-bold text-3xl`}>
                                {getInitials(user?.name, user?.email)}
                            </Text>
                        </View>
                        {user?.premium && (
                            <View className="flex-col items-center gap-1">
                                <Text className="text-[#6b5aed] font-semibold text-[14px]">
                                    PREMIUM MEMBERSHIP
                                </Text>
                            </View>
                        )}
                        <View className="w-[90%]">
                            <View className="w-full border-b border-gray-300 my-6" />
                            <Text className="text-gray-500 font-semibold text-[14px] mb-6">PERSONAL DETAILS</Text>
                            <View className="flex flex-col gap-2">
                                <View className="flex flex-row items-center justify-between">
                                    <Text className="text-black font-medium text-[16px]">Full name</Text>
                                    {
                                        !edit.fullName && (
                                            <TouchableOpacity onPress={() => setEdit({ ...edit, fullName: true })}><Text className="underline text-black font-medium text-[16px]">Edit</Text></TouchableOpacity>
                                        )
                                    }
                                </View>
                                {
                                    edit.fullName === true ? (
                                        <>
                                            <View className="flex flex-col items-start w-full gap-4">
                                                <TextInput
                                                    value={firstName}
                                                    onChangeText={setFirstName}
                                                    placeholder={user?.firstName}
                                                    className="text-black font-normal w-full text-[18px] border border-gray-300 rounded-2xl py-3 px-2 bg-white"
                                                />
                                                <TextInput
                                                    value={lastName}
                                                    onChangeText={setLastName}
                                                    placeholder={user?.lastName}
                                                    className="text-black font-normal w-full text-[18px] border border-gray-300 rounded-2xl py-3 px-2 bg-white"
                                                />
                                                {error && <Text className="text-red-500 text-left font-medium text-[16px]">{error}</Text>}
                                                {loading ? (
                                                    <View className="w-full bg-white rounded-3xl py-3 px-2">
                                                        <ActivityIndicator size="large" color="#6b5aed" />
                                                    </View>
                                                ) : (
                                                    <>
                                                        <TouchableOpacity onPress={changeFirstLastName} className="w-full bg-[#6b5aed] rounded-3xl py-3 px-2">
                                                            <Text className="text-white text-center font-medium text-[16px]">Save</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity className="w-full bg-white rounded-3xl py-3 px-2 border border-gray-300" onPress={() => setEdit({ ...edit, fullName: false })}>
                                                            <Text className="text-black font-medium text-center text-[16px]">Cancel</Text>
                                                        </TouchableOpacity>
                                                    </>
                                                )}
                                            </View>
                                        </>
                                    ) : (
                                        <Text className="text-gray-500 font-normal text-[16px]">{user?.firstName + ' ' + user?.lastName}</Text>
                                    )
                                }
                            </View>
                            <View className="w-full border-b border-gray-300 my-6" />
                            <View className="flex flex-col gap-2">
                                <View className="flex flex-row items-center justify-between">
                                    <Text className="text-black font-medium text-[16px]">Password</Text>
                                    {!edit.password &&
                                        (<TouchableOpacity onPress={() => setEdit({ ...edit, password: true })}><Text className="underline text-black font-medium text-[16px]">Edit</Text></TouchableOpacity>)}
                                </View>
                                {
                                    edit.password === true ? (
                                        <>
                                            <View className="flex flex-col items-start w-full gap-4">
                                                <View className="flex flex-row items-center w-full border border-gray-300 rounded-2xl bg-white">
                                                    <TextInput
                                                        value={password}
                                                        onChangeText={setPassword}
                                                        placeholder="Current password"
                                                        secureTextEntry={!showPassword}
                                                        className="text-black font-normal flex-1 text-[18px] py-4 px-2"
                                                    />
                                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-3">
                                                        <IconSymbol name={showPassword ? "eye.slash" : "eye"} size={20} color="#6B7280" />
                                                    </TouchableOpacity>
                                                </View>
                                                {errorOldPassword && <Text className="text-red-500 text-left font-medium text-[14px] -mt-2">{errorOldPassword}</Text>}
                                                <View className="flex flex-row items-center w-full border border-gray-300 rounded-2xl bg-white">
                                                    <TextInput
                                                        value={newPassword}
                                                        onChangeText={setNewPassword}
                                                        placeholder="New password"
                                                        secureTextEntry={!showNewPassword}
                                                        className="text-black font-normal flex-1 text-[18px] py-4 px-2"
                                                    />
                                                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} className="px-3">
                                                        <IconSymbol name={showNewPassword ? "eye.slash" : "eye"} size={20} color="#6B7280" />
                                                    </TouchableOpacity>
                                                </View>
                                                {errorNewPassword && <Text className="text-red-500 text-left font-medium text-[14px] -mt-2">{errorNewPassword}</Text>}
                                                <View className="flex flex-row items-center w-full border border-gray-300 rounded-2xl bg-white">
                                                    <TextInput
                                                        value={confirmNewPassword}
                                                        onChangeText={setConfirmNewPassword}
                                                        placeholder="Confirm password"
                                                        secureTextEntry={!showConfirmPassword}
                                                        className="text-black font-normal flex-1 text-[18px] py-4 px-2"
                                                    />
                                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="px-3">
                                                        <IconSymbol name={showConfirmPassword ? "eye.slash" : "eye"} size={20} color="#6B7280" />
                                                    </TouchableOpacity>
                                                </View>
                                                {errorConfirmPassword && <Text className="text-red-500 text-left font-medium text-[14px] -mt-2">{errorConfirmPassword}</Text>}
                                                {loadingPassword ? (
                                                    <View className="w-full bg-white rounded-3xl py-3 px-2">
                                                        <ActivityIndicator size="large" color="#6b5aed" />
                                                    </View>
                                                ) : (
                                                    <>
                                                        <TouchableOpacity className="w-full bg-[#6b5aed] rounded-3xl py-3 px-2" onPress={changePassword}>
                                                            <Text className="text-white text-center font-medium text-[16px]">Save</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity className="w-full bg-white rounded-3xl py-3 px-2 border border-gray-300" onPress={() => setEdit({ ...edit, password: false })}>
                                                            <Text className="text-black font-medium text-center text-[16px]">Cancel</Text>
                                                        </TouchableOpacity>
                                                    </>
                                                )}

                                            </View>
                                        </>
                                    ) : (
                                        <Text className="text-gray-500 font-normal text-[16px]">********</Text>
                                    )
                                }
                            </View>
                            <View className="w-full border-b border-gray-300 my-6" />
                            <View className="flex flex-col gap-2">
                                <View className="flex flex-row items-center justify-between">
                                    <Text className="text-black font-medium text-[16px]">Email address</Text>
                                </View>
                                <Text className="text-gray-500 font-normal text-[16px]">{user?.email}</Text>
                            </View>
                            <View className="w-full border-b border-gray-300 my-6" />
                            {user?.premium && <>
                                <View className="flex flex-col gap-2">
                                    <View className="flex flex-row items-center justify-between">
                                        <Text className="text-[#6b5aed] font-medium text-[16px]">Premium Membership</Text>
                                    </View>
                                    <Text className="text-[#6b5aed]/80 font-normal text-[16px]">
                                        Active until <Text className="text-[#6b5aed] font-semibold">{new Date(user.premiumUntil!).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</Text>
                                    </Text>
                                    <Text className="text-[#6b5aed]/60 font-normal text-[10px]">Manage your subscription in Others section</Text>
                                </View>
                                <View className="w-full border-b border-gray-300 my-6" />
                            </>}
                            <Text className="text-gray-500 font-semibold text-[14px] mb-6">OTHERS</Text>
                            {!user?.premium ? (<TouchableOpacity className="flex flex-row items-center justify-between" onPress={() => { setSubscriptionProceedModalVisible(true); setSubscriptionProceedModalType('upgrade') }}>
                                <Text className="text-[#6b5aed] font-medium text-[16px]">Upgrade to Premium</Text>
                                <IconSymbol name="chevron.right" size={12} color="#6b5aed" />
                            </TouchableOpacity>) :
                                (<TouchableOpacity className="flex flex-row items-center justify-between" onPress={() => { setSubscriptionProceedModalVisible(true); setSubscriptionProceedModalType('manage') }}>
                                    <Text className="text-[#6b5aed] font-medium text-[16px]">Manage subscription</Text>
                                    <IconSymbol name="chevron.right" size={12} color="#6b5aed" />
                                </TouchableOpacity>)}
                            <TouchableOpacity className="flex flex-row items-center justify-between mt-4" onPress={() => setDeleteAccountModalVisible(true)}>
                                <Text className="text-red-500 font-medium text-[16px]">Delete account</Text>
                                <IconSymbol name="chevron.right" size={12} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <DeleteAccountModal
                visible={deleteAccountModalVisible}
                onClose={() => setDeleteAccountModalVisible(false)}
            />
            <SubscriptionProceedModal
                visible={subscriptionProceedModalVisible}
                onClose={() => setSubscriptionProceedModalVisible(false)}
                type={subscriptionProceedModalType}
            />
            <SuccessModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                loading={successLoading}
            />
        </LinearGradient>
    );
}
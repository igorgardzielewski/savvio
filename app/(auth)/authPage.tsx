import React, { useEffect, useMemo, useState, useRef } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Text } from "@/components/ui/Text";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

type Mode = "login" | "register" | "verify";

export default function AuthPage() {
    const router = useRouter();
     const [isIntroDone, setIsIntroDone] = useState(false);
     const [mode, setMode] = useState<Mode>("login");
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [confirm, setConfirm] = useState("");
     const [firstName, setFirstName] = useState("");
     const [lastName, setLastName] = useState("");
     const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
     const [showDatePicker, setShowDatePicker] = useState(false);
     const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirm?: string; firstName?: string; lastName?: string; dateOfBirth?: string }>({});
     const [verifyCode, setVerifyCode] = useState<string[]>(Array(6).fill(''));
     const [showSuccess, setShowSuccess] = useState(false);
    const inputsRef = useRef<(TextInput | null)[]>([]);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const { login, register, loading, error, errorFields, clearError, clearFieldErrors, resendVerification, isAuthenticated, needsVerification, pendingEmail, googleSignIn } = useAuthStore();

    useEffect(() => {
        clearError();
        clearFieldErrors();
        setFieldErrors({});
        setVerifyCode(Array(6).fill(''));
    }, [mode, clearError, clearFieldErrors]);

    useEffect(() => {
        if (needsVerification && pendingEmail) {
            setMode('verify');
            setEmail(pendingEmail);
        }
    }, [needsVerification, pendingEmail]);

    useEffect(() => {
        if (isAuthenticated) {
            setShowSuccess(true);
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }).start();

            const timer = setTimeout(() => {
                router.replace('/(tabs)');
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, router, scaleAnim]);

    const canSubmit = useMemo(() => {
        const base = !!email && !!password;
        if (!base) return false;
        if (mode === 'register') {
            return password === confirm && !!firstName && !!lastName && !!dateOfBirth;
        }
        return true;
    }, [email, password, confirm, mode, firstName, lastName, dateOfBirth]);

    const onSubmit = async () => {
        clearError();
        clearFieldErrors();
        setFieldErrors({});
        const errors: { email?: string; password?: string; confirm?: string; firstName?: string; lastName?: string; dateOfBirth?: string } = {};
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
        if (!emailOk) {
            errors.email = "Please enter a valid email.";
        }
        if (!password || password.length < 6) {
            errors.password = "Password must be at least 6 characters.";
        }
        if (mode === "register") {
            if (!firstName.trim()) errors.firstName = "First name required.";
            if (!lastName.trim()) errors.lastName = "Last name required.";
            if (!dateOfBirth) {
                errors.dateOfBirth = "Select your date of birth.";
            } else {
                const today = new Date();
                let age = today.getFullYear() - dateOfBirth.getFullYear();
                const m = today.getMonth() - dateOfBirth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) age--;
                if (age < 18) errors.dateOfBirth = "You must be at least 18 years old.";
            }
            if (!confirm) {
                errors.confirm = "Confirm your password.";
            } else if (password !== confirm) {
                errors.confirm = "Passwords do not match.";
            }
        }
        if (Object.keys(errors).length) {
            setFieldErrors(errors);
            return;
        }
        if (mode === "login") {
            await login(email.trim(), password);
        } else {
            const dobString = dateOfBirth?.toISOString().split('T')[0];
            await register(
                email.trim(),
                password,
                confirm.trim(),
                firstName.trim(),
                lastName.trim(),
                dobString
            );
        }
        if (errorFields) {
            setFieldErrors(errorFields);
        }
    };
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
                <View className="flex-1 bg-accent justify-end">
                    {showSuccess ? (
                        <View className="flex-1 bg-accent items-center justify-center">
                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                <View className="bg-white rounded-full p-6 mb-6">
                                    <Ionicons name="checkmark-circle" size={100} color="#6B5AED" />
                                </View>
                            </Animated.View>
                            <Text className="text-white text-3xl font-bold">Success!</Text>
                        </View>
                    ) : !isIntroDone ? (
                        <View className="flex-1 w-full bg-accent items-center justify-end">
                            <View
                                style={{
                                    width: '100%',
                                    height: 480, // Wysokość widocznej części obrazu
                                    overflow: 'hidden',
                                    opacity: 0.8
                                }}
                            >
                                <Image
                                    source={require('@/assets/images/phoneappview2.png')}
                                    style={{
                                        width: '100%',
                                        height: undefined,
                                        aspectRatio: 0.5
                                    }}
                                    resizeMode="contain"
                                />
                            </View>
                            <SafeAreaView edges={["bottom"]} className="gap-4 flex w-full bg-accent px-6 py-2 pb-6">
                                <View>
                                    <Text className="text-left font-bold text-white text-4xl leading-tight">
                                        Welcome to Savvio{"\n"}Your Finance App
                                    </Text>
                                    <Text className="text-left font-semibold text-white/80 text-xl mt-2 leading-7">
                                        Savvio is an app directed to help you manage your finances effortlessly.
                                    </Text>
                                </View>
                                <TouchableOpacity className="bg-white w-full py-2 rounded-full" onPress={() => setIsIntroDone(true)}>
                                    <Text className="text-accent text-center p-4 text-lg font-semibold">Get Started</Text>
                                </TouchableOpacity>
                            </SafeAreaView>
                        </View>
                    ) : (
                        <View className="flex justify-end w-full h-full">
                            <Text className="text-left font-bold text-white text-4xl leading-tight mb-2 px-2">
                                {mode === 'login' ? 'Login to Savvio' : mode === 'register' ? 'Register to Savvio' : 'Verify your account'}
                            </Text>

                            <View className="flex flex-col items-center justify-start bg-white rounded-t-[24px] h-[75%]">
                                {mode === 'verify' ? (
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, width: '100%' }}>
                                        <Text className="text-xl font-semibold mb-6">Enter verification code</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                                             {verifyCode.map((digit, index) => (
                                                 <TextInput
                                                     key={index}
                                                     ref={(el) => { inputsRef.current[index] = el; }}
                                                     value={digit ? String(digit) : ''}
                                                     onChangeText={(text) => {
                                                         const clean = text.replace(/[^0-9]/g, '');
                                                         const newCode = [...verifyCode];
                                                         if (clean.length > 1) {
                                                             let i = index;
                                                             for (const ch of clean) {
                                                                 if (i >= newCode.length) break;
                                                                 newCode[i] = ch;
                                                                 i++;
                                                             }
                                                             setVerifyCode(newCode);
                                                             if (i < newCode.length) {
                                                                 inputsRef.current[i]?.focus();
                                                             } else {
                                                                 inputsRef.current[newCode.length - 1]?.focus();
                                                                 Keyboard.dismiss();
                                                             }
                                                         } else {
                                                             newCode[index] = clean.charAt(0) || '';
                                                             setVerifyCode(newCode);
                                                             if (clean && index < newCode.length - 1) {
                                                                 inputsRef.current[index + 1]?.focus();
                                                             }
                                                         }
                                                     }}
                                                     onKeyPress={({ nativeEvent }) => {
                                                         if (nativeEvent.key === 'Backspace' && !verifyCode[index] && index > 0) {
                                                             inputsRef.current[index - 1]?.focus();
                                                         }
                                                     }}
                                                     keyboardType="number-pad"
                                                     returnKeyType="next"
                                                     maxLength={1}
                                                     style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, width: 48, height: 48, textAlign: 'center', fontSize: 20, marginHorizontal: 6 }}
                                                 />
                                             ))}
                                         </View>
                                        <TouchableOpacity onPress={() => resendVerification(email.trim())} className="mb-4">
                                            <Text className="text-accent font-semibold">Resend code</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            disabled={verifyCode.join('').length !== 6 || loading}
                                            onPress={() => {
                                                if (verifyCode.join('').length === 6) {
                                                    // użyj verify z authStore
                                                    useAuthStore.getState().verify(email.trim(), verifyCode.join(''));
                                                }
                                            }}
                                            className={`w-full rounded-2xl py-4 ${verifyCode.join('').length === 6 && !loading ? 'bg-accent' : 'bg-accent/40'}`}
                                            style={{ opacity: (verifyCode.join('').length !== 6 || loading) ? 0.5 : 1 }}
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="#ffffff" />
                                            ) : (
                                                <Text className="text-white text-center text-lg font-semibold">Verify</Text>
                                            )}
                                        </TouchableOpacity>
                                        {error ? <Text className="text-red-500 text-sm mt-3">{error}</Text> : null}
                                        <TouchableOpacity onPress={() => {
                                            setMode('login');
                                            setVerifyCode(Array(6).fill(''));
                                            useAuthStore.setState({ needsVerification: false, pendingEmail: null });
                                        }} className="py-4">
                                            <Text className="text-center text-sm text-gray-500">Back to <Text className="font-semibold text-accent">Login</Text></Text>
                                        </TouchableOpacity>
                                     </View>
                                 ) : (
                                    <ScrollView className="w-full" style={{ flex: 1 }} contentContainerStyle={{ padding: 24, gap: 16, flexGrow: 1, justifyContent: 'flex-start' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                        <View className="gap-4">
                                            <View className="bg-gray-200 py-2 px-2 items-center justify-center flex-row rounded-full gap-2 w-full">
                                                <TouchableOpacity
                                                    className={`flex-1 px-6 py-4 rounded-full ${mode === 'login' ? 'bg-accent' : 'bg-white'}`}
                                                    onPress={() => {
                                                        setMode('login');
                                                        useAuthStore.setState({ needsVerification: false, pendingEmail: null });
                                                    }}
                                                    disabled={loading}
                                                >
                                                    <Text className={`text-center ${mode === 'login' ? 'font-bold' : 'font-semibold'}`} style={{ color: mode === 'login' ? 'white' : '#6B5AED' }}>Login</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    className={`flex-1 px-6 py-4 rounded-full ${mode === 'register' ? 'bg-accent' : 'bg-white'}`}
                                                    onPress={() => {
                                                        setMode('register');
                                                        useAuthStore.setState({ needsVerification: false, pendingEmail: null });
                                                    }}
                                                    disabled={loading}
                                                >
                                                    <Text className={`text-center ${mode === 'register' ? 'font-bold' : 'font-semibold'}`} style={{ color: mode === 'register' ? 'white' : '#6B5AED' }}>Register</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <View className="w-full mt-2 gap-3">
                                                <TextInput placeholder="Email" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" className={`w-full border rounded-2xl px-4 py-4 bg-white ${(fieldErrors.email || errorFields?.email) ? 'border-red-500' : 'border-gray-200'}`} />
                                                {(fieldErrors.email || errorFields?.email) && <Text className="text-red-500 text-xs -mt-1">{fieldErrors.email || errorFields?.email}</Text>}

                                                {mode === 'register' && (
                                                    <>
                                                        <View className="flex-row gap-3">
                                                            <View className="flex-1">
                                                                <TextInput placeholder="First name" placeholderTextColor="#9CA3AF" value={firstName} onChangeText={setFirstName} autoCapitalize="words" textContentType="givenName" className={`border rounded-2xl px-4 py-4 bg-white ${(fieldErrors.firstName || errorFields?.firstName) ? 'border-red-500' : 'border-gray-200'}`} />
                                                                {(fieldErrors.firstName || errorFields?.firstName) && <Text className="text-red-500 text-xs -mt-1">{fieldErrors.firstName || errorFields?.firstName}</Text>}
                                                            </View>
                                                            <View className="flex-1">
                                                                <TextInput placeholder="Last name" placeholderTextColor="#9CA3AF" value={lastName} onChangeText={setLastName} autoCapitalize="words" textContentType="familyName" className={`border rounded-2xl px-4 py-4 bg-white ${(fieldErrors.lastName || errorFields?.lastName) ? 'border-red-500' : 'border-gray-200'}`} />
                                                                {(fieldErrors.lastName || errorFields?.lastName) && <Text className="text-red-500 text-xs -mt-1">{fieldErrors.lastName || errorFields?.lastName}</Text>}
                                                            </View>
                                                        </View>

                                                        <TouchableOpacity onPress={() => setShowDatePicker(true)} className={`w-full border rounded-2xl px-4 py-4 bg-white ${(fieldErrors.dateOfBirth || errorFields?.dateOfBirth) ? 'border-red-500' : 'border-gray-200'}`}>
                                                            <Text className={dateOfBirth ? 'text-base' : 'text-base text-gray-400'}>{dateOfBirth ? dateOfBirth.toLocaleDateString() : 'Date of birth'}</Text>
                                                        </TouchableOpacity>
                                                        {(fieldErrors.dateOfBirth || errorFields?.dateOfBirth) && <Text className="text-red-500 text-xs -mt-1">{fieldErrors.dateOfBirth || errorFields?.dateOfBirth}</Text>}

                                                        {showDatePicker && (
                                                            <View className={'px-6 justify-center flex items-center border border-gray-200 rounded-3xl py-4 mb-4'}>
                                                                <DateTimePicker value={dateOfBirth || new Date()} mode="date" style={{ alignSelf: 'center' }} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(event, selectedDate) => {
                                                                    setShowDatePicker(Platform.OS === 'ios');
                                                                    if (selectedDate) setDateOfBirth(selectedDate);
                                                                }} maximumDate={new Date()} />
                                                                <TouchableOpacity className={'bg-accent w-1/2 rounded-full py-1'} onPress={() => setShowDatePicker(false)}>
                                                                    <Text className="text-white text-center p-2 text-lg font-semibold">Save</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        )}
                                                    </>
                                                )}

                                                <TextInput
                                                    placeholder="Password"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={password}
                                                    onChangeText={setPassword}
                                                    secureTextEntry
                                                    autoCapitalize="none"
                                                    textContentType={mode === 'register' ? 'newPassword' : 'password'}
                                                    passwordRules={mode === 'register' ? 'minlength: 6;' : undefined}
                                                    className={`w-full border rounded-2xl px-4 py-4 bg-white ${(fieldErrors.password || errorFields?.password) ? 'border-red-500' : 'border-gray-200'}`}
                                                />
                                                {(fieldErrors.password || errorFields?.password) && <Text className="text-red-500 text-xs -mt-1">{fieldErrors.password || errorFields?.password}</Text>}

                                                {mode === 'register' && (
                                                    <>
                                                        <TextInput
                                                            placeholder="Confirm Password"
                                                            placeholderTextColor="#9CA3AF"
                                                            value={confirm}
                                                            onChangeText={setConfirm}
                                                            secureTextEntry
                                                            autoCapitalize="none"
                                                            textContentType="newPassword"
                                                            className={`w-full border rounded-2xl px-4 py-4 bg-white ${(fieldErrors.confirm || errorFields?.confirm) ? 'border-red-500' : 'border-gray-200'}`}
                                                        />
                                                        {(fieldErrors.confirm || errorFields?.confirm) && <Text className="text-red-500 text-xs -mt-1">{fieldErrors.confirm || errorFields?.confirm}</Text>}
                                                    </>
                                                )}

                                                {error ? <Text className="text-red-500 text-sm mt-1">{error}</Text> : null}

                                            </View>

                                            <TouchableOpacity
                                                onPress={onSubmit}
                                                className={`rounded-2xl py-4 ${(!canSubmit || loading) ? 'bg-accent/40' : 'bg-accent'}`}
                                                disabled={!canSubmit || loading}
                                                style={{ opacity: (!canSubmit || loading) ? 0.5 : 1 }}
                                            >
                                                {loading ? (
                                                    <ActivityIndicator color="white" />
                                                ) : (
                                                    <Text className="text-white text-center text-lg font-semibold">{mode === 'login' ? 'Login' : 'Register'}</Text>
                                                )}
                                            </TouchableOpacity>

                                            {mode === 'login' ? (
                                                <TouchableOpacity onPress={() => {
                                                    setMode('register');
                                                    useAuthStore.setState({ needsVerification: false, pendingEmail: null });
                                                }} className="py-4">
                                                    <Text className="text-center text-sm text-gray-500">Don&#39;t have an account? <Text className="font-semibold text-accent">Register here</Text></Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity onPress={() => {
                                                    setMode('login');
                                                    useAuthStore.setState({ needsVerification: false, pendingEmail: null });
                                                }} className="py-4">
                                                    <Text className="text-center text-sm text-gray-500">Already have an account? <Text className="font-semibold text-accent">Login here</Text></Text>
                                                </TouchableOpacity>
                                            )}
                                            {mode === 'login' &&
                                                <>
                                                    <View className={'h-1 border-t border-gray-200 mx-6'}/>
                                                    <TouchableOpacity
                                                        className={`rounded-full py-4 border-gray-300 border-2 items-center justify-center flex-row gap-2 ${loading ? 'opacity-50' : ''}`}
                                                        onPress={googleSignIn}
                                                        disabled={loading}
                                                    >
                                                        <Ionicons name="logo-google" size={20} color="#4285F4" />
                                                        <Text className={'font-semibold text-heading'} >Kontynuuj z Google</Text>
                                                    </TouchableOpacity>
                                                </>
                                            }
                                        </View>
                                    </ScrollView>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
);
 }


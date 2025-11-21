// app/_layout.tsx
import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { View, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts } from 'expo-font';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from "@/store/userStore";
// Remove forced initialRouteName
export const unstable_settings = {};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const segments = useSegments();
    const [fontsLoaded] = useFonts({
        Manrope: require('../assets/fonts/Manrope-VariableFont_wght.ttf'),
        Sixtyfour: require('../assets/fonts/Sixtyfour.ttf'),
        Inter: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    });
    const {setUser} = useUserStore();

    React.useEffect(() => {
        if (!fontsLoaded) return;
        const inAuthGroup = segments[0] === '(auth)';
        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/authPage');
        }
    }, [isAuthenticated, segments, fontsLoaded, router]);

    if (!fontsLoaded) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-black">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
                initialRouteName={isAuthenticated ? '(tabs)' : '(auth)'}
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                }}
            >
                {!isAuthenticated ? (
                    <Stack.Screen name="(auth)" />
                ) : (
                    <>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="(budget)" />
                        <Stack.Screen name="(aiassistant)" />
                        <Stack.Screen name="(addexpense)" />
                        <Stack.Screen
                            name="modal"
                            options={{
                                presentation: 'modal',
                                title: 'Modal',
                                headerShown: true,
                            }}
                        />
                    </>
                )}
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
    );
}

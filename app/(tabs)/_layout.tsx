import {Tabs, usePathname, useRouter} from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomTabBar } from '@/components/ui/CustomTabBar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {Text} from '@/components/ui/Text'
import {useUserStore} from "@/store/userStore";
import {useAuthStore} from "@/store/authStore";
export default function TabLayout() {
    const [isExpanded, setIsExpanded] = useState(false);
    const widthAnim = useRef(new Animated.Value(56)).current;
    const pathname = usePathname();
    const router = useRouter();
    const {setUser, isUserFetched} = useUserStore();
    const {isAuthenticated, token, logout} = useAuthStore();

    useEffect(() => {
        const fetchUser = async () => {
            if (!isAuthenticated || !token || isUserFetched) {
                return;
            }

            try {
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    logout();
                    router.replace('/(auth)/authPage');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };

        fetchUser();
    }, [isAuthenticated, token, isUserFetched, setUser, logout, router]);

    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: isExpanded ? 160 : 56,
            duration: 150,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start();
    }, [isExpanded]);
    const getHeaderContent = () => {
        if (pathname === '/explore') {
            return {
                title: 'Your transactions',
                subtitle: 'Track your spendings',
                titleColor: 'text-black',
                subtitleColor: 'text-[#6b5aed]',
            };
        } else if (pathname === '/subscriptions') {
            return {
                title: 'Payment Overview',
                subtitle: 'Manage your finances',
                titleColor: 'text-black',
                subtitleColor: 'text-[#6b5aed]',
            };
        }
        return {
            title: 'Hello, Igor',
            subtitle: 'Welcome to Savvio',
            titleColor: 'text-black',
            subtitleColor: 'text-[#6b5aed]',
        };
    };

    const headerContent = getHeaderContent();

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/authPage');
    };

    return (
        <SafeAreaView
            className="flex flex-1 bg-[#f2f0ff]"
            edges={['top', 'left', 'right']}
        >
            <View className={'flex flex-row items-center justify-between w-full'}>
            <View className="flex flex-row items-end py-1 px-4 gap-4">
                <Animated.View
                    style={{
                        width: widthAnim,
                        backgroundColor: 'white',
                        borderRadius: 9999,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: 4,
                        gap: 8,
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                    }}
                >
                    {isExpanded && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Pressable onPress={handleLogout}>
                                <View className="rounded-full p-2 flex items-center justify-center">
                                    <IconSymbol name="gear" size={28} color="#6b5aed" />
                                </View>
                            </Pressable>
                            <Pressable onPress={() => console.log('Profile pressed')}>
                                <View className="rounded-full p-2 flex items-center justify-center">
                                    <IconSymbol name="person" size={28} color="#6b5aed" />
                                </View>
                            </Pressable>
                        </View>
                    )}

                    <Pressable onPress={() => setIsExpanded(!isExpanded)}>
                        <Animated.Image
                            source={{
                                uri: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=100&q=80',
                            }}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 9999,
                                borderColor: '#6b5aed',
                                borderWidth: 2,
                            }}
                        />
                    </Pressable>
                </Animated.View>
                <View>
                    <Text className={`text-2xl font-bold ${headerContent.titleColor}`}>
                        {headerContent.title}
                    </Text>
                    <Text className={`text-xl ${headerContent.subtitleColor}`}>
                        {headerContent.subtitle}
                    </Text>
                </View>
            </View>
            </View>

            <Tabs
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => (
                            <IconSymbol name="house" size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="budget"
                    options={{
                        title: 'Budget',
                        tabBarIcon: ({ color }) => (
                            <IconSymbol name="list.bullet.rectangle" size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="explore"
                    options={{
                        title: 'Transactions',
                        tabBarIcon: ({ color }) => (
                            <IconSymbol name="creditcard" size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="subscriptions"
                    options={{
                        title: 'Payments',
                        tabBarIcon: ({ color }) => (
                            <IconSymbol name="chart.pie" size={24} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
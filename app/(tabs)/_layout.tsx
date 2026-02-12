import GenerateReportModal from '@/components/GenerateReportModal';
import { CustomTabBar } from '@/components/ui/CustomTabBar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text } from '@/components/ui/Text';
import { useFamilyWebSocket } from '@/hooks/useFamilyWebSocket';
import { useAuthStore } from "@/store/authStore";
import type { Budget } from "@/store/userStore";
import { useUserStore } from "@/store/userStore";
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {BudgetReport, ReportBudgetSummary} from "@/types";
export default function TabLayout() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const widthAnim = useRef(new Animated.Value(56)).current;
    const pathname = usePathname();
    const router = useRouter();
    const { user, setUser, isUserFetched } = useUserStore();
    const { isAuthenticated, token, logout } = useAuthStore();
    const { getInitials } = require('@/helpers/stringHelpers');
    const [isLoading, setIsLoading] = useState(false);
    useFamilyWebSocket();

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
                    console.log('Fetched user data:', data);
                    setUser(data);

                    if (data.subscriptions && data.subscriptions.length > 0) {
                        const { checkAndScheduleAllSubscriptionNotifications } = await import('@/helpers/notificationHelpers');
                        await checkAndScheduleAllSubscriptionNotifications(data.subscriptions);
                    }
                } else {
                    logout();
                    router.replace('/(auth)/authPage');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };

        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, token, isUserFetched]);
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
            title: `Hello, ${user?.firstName}`,
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
    const handleFetchReport = async (budgetId:number | undefined) => {
        if (!budgetId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/report/${budgetId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json() as BudgetReport;
                setReportModalVisible(false);
                router.push({
                    pathname: '/(report)/report',
                    params: {
                        reportData: JSON.stringify(data)
                    }
                });
            }
        }
        catch (error) {
            console.error('Failed to fetch report:', error);
        }
        finally {
            setIsLoading(false);
        }
    }
    return (
        <SafeAreaView
            className="flex flex-1 bg-[#f2f0ff]"
            edges={['top', 'left', 'right']}
        >
            <View className={'flex flex-row items-center justify-between w-full px-4'}>
                <View className="flex flex-row items-end py-1 gap-4">
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
                                        <IconSymbol name="rectangle.portrait.and.arrow.right" size={28} color="#6b5aed" />
                                    </View>
                                </Pressable>
                                <Pressable onPress={() => router.push('/(profile)')}>
                                    <View className="rounded-full p-2 flex items-center justify-center">
                                        <IconSymbol name="person" size={28} color="#6b5aed" />
                                    </View>
                                </Pressable>
                            </View>
                        )}

                        <Pressable onPress={() => setIsExpanded(!isExpanded)}>
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 9999,
                                    borderColor: user?.premium ? '#6b5aed' : '#9CA3AF',
                                    borderWidth: 2,
                                    backgroundColor: user?.premium ? '#e0e7ff' : '#D1D5DB',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text className={` ${user?.premium ? 'text-[#6b5aed]' : 'text-[#6B7280]'} font-bold text-xl`}>
                                    {getInitials(user?.name, user?.email)}
                                </Text>
                            </View>
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

                {!isExpanded && pathname === '/budget' && (
                    <TouchableOpacity
                        onPress={() => setReportModalVisible(true)}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: '#6b5aed',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#6b5aed',
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 },
                        }}
                    >
                        <IconSymbol name="chart.bar.doc.horizontal" size={22} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            <GenerateReportModal
                visible={reportModalVisible}
                onClose={() => setReportModalVisible(false)}
                onGenerate={(budget: Budget) => {
                    handleFetchReport(budget.id );
                }}
                isLoading={isLoading}
            />

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
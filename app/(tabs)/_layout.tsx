import { Tabs } from 'expo-router';
import React from 'react';
import { CustomTabBar } from '@/components/ui/CustomTabBar';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
    return (
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
                name="explore"
                options={{
                    title: 'Transactions',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol name="creditcard" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Payments',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol name="chart.pie" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

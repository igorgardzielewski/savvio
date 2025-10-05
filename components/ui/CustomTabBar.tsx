import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="flex-row justify-around items-center flex bg-black mx-5 rounded-full py-2 shadow-lg"
            style={{ paddingBottom: insets.bottom + 10 }}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;
                const icon = options.tabBarIcon
                    ? options.tabBarIcon({
                        color: isFocused ? '#000' : '#aaa',
                        focused: isFocused,
                        size: 24,
                    })
                    : null;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, { merge: true });
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        className={`flex-row items-center px-4 py-2 rounded-full ${
                            isFocused ? 'bg-white' : ''
                        }`}
                    >
                        <View className="mr-2">{icon}</View>
                        {isFocused && typeof label === 'string' && (
                            <Text
                                className={`font-medium ${
                                    isFocused ? 'text-black' : 'text-gray-400'
                                }`}
                            >
                                {label}
                            </Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

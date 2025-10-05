import React from 'react';
import { View, TouchableWithoutFeedback, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MotiView, MotiText } from 'moti';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex-row items-center w-auto justify-center flex bg-black rounded-full py-2 px-2 gap-2 shadow-lg transition-width duration-300"
            style={{ paddingBottom: insets.bottom + 6 }}
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
                    <TouchableWithoutFeedback key={route.key} onPress={onPress}>
                        <MotiView
                            className="relative flex-row items-center rounded-full"
                            animate={{
                                scale: isFocused ? 1 : 1,
                            }}
                            transition={{
                                type: 'timing',
                                duration: 200,
                            }}
                        >
                            {/* Animowane tło aktywnej zakładki */}
                            {isFocused && (
                                <MotiView
                                    from={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: 'timing', duration: 200 }}
                                    className="absolute inset-0 bg-white rounded-full"
                                />
                            )}

                            <View
                                className={`flex-row items-center rounded-full ${
                                    isFocused ? 'px-4 py-2' : 'px-2 py-2'
                                }`}
                            >
                                {/* Ikona */}
                                <MotiView
                                    className={isFocused ? 'mr-2' : ''}
                                    from={{ scale: 0.9, opacity: 0.6 }}
                                    animate={{
                                        scale: isFocused ? 1.1 : 1,
                                        opacity: isFocused ? 1 : 0.7,
                                    }}
                                    transition={{
                                        type: 'timing',
                                        duration: 200,
                                    }}
                                >
                                    {icon}
                                </MotiView>

                                {/* Tekst etykiety */}
                                {typeof label === 'string' && (
                                    <MotiText
                                        from={{ opacity: 0, translateX: -5 }}
                                        animate={{
                                            opacity: isFocused ? 1 : 0,
                                            translateX: isFocused ? 0 : -5,
                                        }}
                                        transition={{
                                            type: 'timing',
                                            duration: 200,
                                        }}
                                        className={`font-medium text-black ${
                                            isFocused ? 'block' : 'hidden'
                                        }`}
                                    >
                                        {label}
                                    </MotiText>
                                )}
                            </View>
                        </MotiView>
                    </TouchableWithoutFeedback>
                );
            })}
        </View>
    );
}

import {View, Image } from "react-native";
import React from "react";
import { MotiView, MotiImage } from "moti";
import {Text} from '@/components/ui/Text'

export default function AiTutorialStepFirst() {
    return (
        <View className="flex-1 flex flex-col justify-between items-center w-full py-8">
            {/* AI Buddy Image - animowany */}
            <MotiView
                from={{ opacity: 0, scale: 0.8, translateY: -30 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{
                    type: "spring",
                    damping: 15,
                    delay: 200
                }}
                className="flex-1 items-center justify-center"
            >
                <MotiImage
                    source={require("@/assets/images/aibuddy4.png")}
                    className="w-72 h-72 object-contain"
                    animate={{
                        translateY: [-10, 0, -10],
                    }}
                    transition={{
                        loop: true,
                        type: "timing",
                        duration: 2000,
                    }}
                />
            </MotiView>

            {/* Text Content - animowany */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                    type: "timing",
                    duration: 600,
                    delay: 400
                }}
                className="w-full"
            >
                <Text className="text-left font-bold text-white text-4xl leading-tight">
                    Meet your smart{'\n'}money assistant
                </Text>
                <Text className="text-left font-semibold text-white/80 text-xl mt-4 leading-7">
                    Savvio learns from your spending habits and helps you understand where your money goes
                </Text>
            </MotiView>
        </View>
    );
}
import { View } from "react-native";
import React from "react";
import { MotiView } from "moti";
import {Text} from '@/components/ui/Text'

export default function AiTutorialStepSecond() {
    const messages = [
        {
            from: "user",
            text: "Where do I spend the most money?",
            delay: 200,
        },
        {
            from: "ai",
            text: "Based on your expenses, you spend most on food delivery — about 45% of your monthly budget! 🍕",
            delay: 1200,
        },
        {
            from: "user",
            text: "How can I save more?",
            delay: 2200,
        },
        {
            from: "ai",
            text: "Try cooking at home 2–3 times a week. You could save around 300 zł monthly! 💡",
            delay: 3200,
        },
    ];

    return (
        <View className="flex-1 flex flex-col justify-between items-center w-full py-8">
            {/* Chat mockup */}
            <View className="flex-1 w-full justify-center gap-4 px-4">
                {messages.map((msg, index) => (
                    <MotiView
                        key={index}
                        from={{
                            opacity: 0,
                            translateX: msg.from === "ai" ? -80 : 80,
                            scale: 0.95,
                        }}
                        animate={{
                            opacity: 1,
                            translateX: 0,
                            scale: 1,
                        }}
                        transition={{
                            type: "spring",
                            damping: 100,
                            delay: msg.delay,
                        }}
                        className={`max-w-[85%] px-5 py-4 rounded-3xl ${
                            msg.from === "user"
                                ? "self-end bg-[#8b7cfb] rounded-tr-md"
                                : "self-start bg-white rounded-tl-md"
                        }`}
                        style={{
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                    >
                        <Text
                            className={`font-medium text-base ${
                                msg.from === "user"
                                    ? "text-white"
                                    : "text-[#7b62f6]"
                            }`}
                        >
                            {msg.text}
                        </Text>
                    </MotiView>
                ))}
            </View>

            {/* Text Content */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                    type: "timing",
                    duration: 600,
                    delay: 1400,
                }}
                className="w-full px-4"
            >
                <Text className="text-left font-bold text-white text-4xl leading-tight">
                    Ask anything about{'\n'}your money
                </Text>
                <Text className="text-left font-semibold text-white/80 text-xl mt-4 leading-7">
                    Chat naturally with Savvio to get insights and personalized saving tips
                </Text>
            </MotiView>
        </View>
    );
}

import { View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { MotiImage, MotiView } from "moti";
interface Props {
    setStep: (step: number) => void;
}
import {Text} from '@/components/ui/Text'

export default function TutorialSuggest({setStep}: Props) {
    const fullText = "Hi there! 👋 I’m Savvio — your personal AI money assistant.";
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(fullText.slice(0, i + 1));
            i++;
            if (i === fullText.length) clearInterval(interval);
        }, 40);
        return () => clearInterval(interval);
    }, []);

    return (
        <View className="flex flex-col items-center w-full mb-6 gap-4">
            {/* AI Buddy – spada z góry */}
            <MotiView
                from={{ translateY: -200, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                transition={{
                    delay: 400,
                    type: "spring",
                    damping: 14,
                }}
                className="self-center"
            >
                <MotiImage
                    source={require("@/assets/images/aibuddy4.png")}
                    className="w-64 h-64 object-contain overflow-hidden"
                    animate={{
                        translateY: [-15, 0, -15],
                    }}
                    transition={{
                        loop: true,
                        type: "timing",
                        duration: 1000,
                    }}
                />
            </MotiView>



            {/* Dymek mowy */}
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1000, type: "timing", duration: 400 }}
                className="bg-white/20 border border-white/30 rounded-3xl px-5 py-4 mt-2"
                style={{
                    maxWidth: "90%",
                    backdropFilter: "blur(10px)",
                }}
            >
                <Text
                    className="text-white font-medium text-lg leading-6"
                    style={{ letterSpacing: 0.5 }}
                >
                    {displayedText}
                    {displayedText.length < fullText.length && (
                        <Text className="text-white opacity-80">|</Text>
                    )}
                </Text>
            </MotiView>

            {/* Teksty pod spodem */}
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 300, duration: 300 }}
                className="flex flex-col items-center w-full gap-3 mt-4"
            >
                <Text
                    className="text-center font-semibold text-white text-3xl"
                    style={{ letterSpacing: 1 }}
                >
                    Watch video tutorial
                </Text>
                <Text
                    className="text-center font-semibold text-white text-3xl"
                    style={{ letterSpacing: 1 }}
                >
                    How to use Savvio
                </Text>
            </MotiView>

            {/* Przycisk */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 300, duration: 300 }}
                className="w-full mt-4 gap-4"
            >
                <TouchableOpacity className="bg-[#f2f0ff] w-full p-6 items-center justify-center rounded-full" onPress={() => setStep(1)}>
                    <Text className="text-[#7b62f6] font-bold text-xl">Yes!</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-[#f2f0ff] w-full p-6 items-center justify-center rounded-full">
                    <Text className="text-[#7b62f6] font-bold text-xl">No, thanks</Text>
                </TouchableOpacity>
            </MotiView>
        </View>
    );
}

import AiTutorialPagination from "@/components/AiTutorialPagination";
import AiTutorialStepFirst from "@/components/AiTutorialStepFirst";
import AiTutorialStepFourth from "@/components/AiTutorialStepFourth";
import AiTutorialStepSecond from "@/components/AiTutorialStepSecond";
import AiTutorialStepThird from "@/components/AiTutorialStepThird";
import TutorialSuggest from "@/components/TutorialSuggest";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from '@/components/ui/Text';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HowItWorks() {
    const [step, setStep] = React.useState(0);
    useEffect(() => {
        if (step >= 5) setStep(0);
    }, [step]);
    const router = useRouter()
    return (
        <LinearGradient
            colors={["#7b62f6", "#745af4"]}
            start={{ x: 0.5, y: 0 }}   // góra
            end={{ x: 0.5, y: 1 }}     // dół
            className="w-full h-full"
        >
            <SafeAreaView className="w-full h-full flex items-center justify-between px-6" edges={['top', 'bottom']}>
                {/*topview*/}
                <View className="flex flex-row items-center justify-between w-full h-16">
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.5}>
                        <View className={'bg-white p-4 rounded-full'}>
                            <IconSymbol name="arrow.left" size={24} weight={'bold'} color="#7b62f6" />
                        </View>
                    </TouchableOpacity>
                    {step != 0 &&
                        <TouchableOpacity activeOpacity={0.5} onPress={() => router.push('/(aiassistant)/AiMain')}>
                            <Text className={'text-3xl font-bold text-white'}>Skip</Text>
                        </TouchableOpacity>
                    }
                </View>
                {step === 0 && <TutorialSuggest setStep={setStep} />}
                {step === 1 && <AiTutorialStepFirst />}
                {step === 2 && <AiTutorialStepSecond />}
                {step === 3 && <AiTutorialStepThird />}
                {step === 4 && <AiTutorialStepFourth />}
                {step !== 0 && <View className="flex flex-row items-center justify-between w-full h-16">
                    <AiTutorialPagination currentStep={step} maxSteps={5} />
                    {step === 4 ? (
                        <TouchableOpacity onPress={() => router.push('/(aiassistant)/AiMain')} activeOpacity={0.5}>
                            <View className={'bg-white p-4 rounded-full'}>
                                <Text className={'font-semibold text-2xl text-[#7b62f6] px-2 text-center'}>Finish</Text>
                            </View>
                        </TouchableOpacity>
                    ) :
                        (
                            <TouchableOpacity onPress={() => setStep(step => step + 1)} activeOpacity={0.5}>
                                <View className={'bg-white p-4 rounded-full'}>
                                    <IconSymbol name="arrow.right" size={24} weight={'bold'} color="#7b62f6" />
                                </View>
                            </TouchableOpacity>
                        )}
                </View>}
            </SafeAreaView>
        </LinearGradient>
    );
}
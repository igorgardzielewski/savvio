import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {Text} from '@/components/ui/Text'
import React, { useState } from "react";
import {
    TextInput,
    View,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    TouchableOpacity, ScrollView, Dimensions
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {MotiImage} from "moti";
import {useRouter} from "expo-router";
const quickActions = [
    { id: 1, label: "Show me my this week spending summary" },
    { id: 2, label: "What are my top expenses?" },
    { id: 3, label: "How can I save more money?" },
    { id: 4, label: "Give me budgeting tips" },
    { id: 5, label: "Analyze my recent transactions" },
    { id: 6, label: "Suggest ways to reduce dining out expenses" },
    { id : 7, label: "Provide insights on my subscription services" },
]
const moreActions = [
    { id: 1, label: "Help me create a budget plan" },
    { id: 2, label: "Do I need subscription services?" },
    { id: 3, label: "Generate charts for my spending habits" },
]
const width = Dimensions.get('window').width;
export default function AiMain() {
    const [inputText, setInputText] = useState('');
    const kbBehavior = Platform.OS === 'ios' ? 'padding' : 'height';
    const [inputFocused, setInputFocused] = useState(false);
    const router = useRouter();
    const handleSend = () => {
        if (inputText.trim()) {
            console.log('Sending:', inputText);
            // Tu twoja logika wysyłania
            setInputText('');
        }
    };

    return (
        <LinearGradient
            colors={["#6b5aed", "#6b5aed"]}
            start={{ x: 0.0, y: 0.5 }}
            end={{ x: 0.0, y: 0.9 }}
            className="w-full h-full"
        >
            <KeyboardAvoidingView behavior={kbBehavior} className="w-full h-full">
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <SafeAreaView className="w-full h-full flex items-center justify-between px-6" edges={['top', 'bottom']}>
                        <View className={'flex-1 flex flex-col justify-start items-center w-full py-8'}>
                            <View className={'flex flex-row justify-between items-center w-full mb-4'}>
                                <TouchableOpacity
                                    className={'bg-white/10 rounded-full p-4 border border-white/30'}
                                    onPress={()=>router.push('/(tabs)')}
                                >
                                    <IconSymbol name={'arrow.left'} color={'white'} size={24} weight={'bold'} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={'bg-white/10 rounded-full p-4 border border-white/30'}
                                >
                                    <IconSymbol name={'bubble'} color={'white'} size={24} weight={'bold'} />
                                </TouchableOpacity>
                            </View>
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
                        {!inputFocused && (
                            <View className={'h-[40%] flex flex-col gap-5'}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName={'h-full px-6'} className={'-mx-6 h-1/2'} >
                                    {
                                        quickActions.map(action => (
                                            <TouchableOpacity
                                                key={action.id}
                                                className={'bg-white/10 rounded-[24px] p-4 border border-white/30 mr-4'}
                                                style={{maxWidth: width * 0.35}}
                                                onPress={() => {
                                                    setInputText(action.label);
                                                }}
                                            >
                                                <Text className={'text-white font-semibold'}>{action.label}</Text>
                                            </TouchableOpacity>
                                        ))
                                    }
                                </ScrollView>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName={'h-full px-6'} className={'-mx-6 h-1/2'} >
                                {
                                    moreActions.map(action => (
                                        <TouchableOpacity
                                            key={action.id}
                                            className={'bg-white/10 rounded-[24px] p-4 border border-white/30 mr-4'}
                                            style={{maxWidth: width * 0.35}}
                                            onPress={() => {
                                                setInputText(action.label);
                                            }}
                                        >
                                            <Text className={'text-white font-semibold'}>{action.label}</Text>
                                        </TouchableOpacity>
                                    ))
                                }
                                </ScrollView>
                            </View>
                        )
                        }
                        </View>
                        <View className="w-full bg-white/30 p-3 rounded-[34px] flex-row  border border-white/30 items-center ">
                            <TextInput
                                value={inputText.trim() ? inputText : ''}
                                onChangeText={setInputText}
                                className="flex-1 px-3 py-2 text-lg font-medium text-white"
                                style={{
                                    fontFamily: 'Inter',
                                    maxHeight: 90,
                                }}
                                placeholder="Write a message..."
                                placeholderTextColor="white"
                                multiline
                                numberOfLines={3}
                                onFocus={() => {setInputFocused(true)}}
                                onBlur={() => {setInputFocused(false)}}
                                textAlignVertical="center"
                                scrollEnabled={true}
                                returnKeyType="default"
                                blurOnSubmit={false}
                            />
                            <TouchableOpacity
                                className="bg-[#6b5aed] rounded-full p-2 ml-2"
                                onPress={handleSend}
                                disabled={!inputText.trim()}
                                style={{
                                    opacity: inputText.trim() ? 1 : 0.5
                                }}
                            >
                                <IconSymbol name="paperplane.fill" color="white" weight="bold" size={24} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}
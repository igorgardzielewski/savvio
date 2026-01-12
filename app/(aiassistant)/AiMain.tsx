import BlockRenderer from "@/components/ai_components/BlockRenderer";
import ChatBubble from "@/components/ai_components/ChatBubble";
import LoadingElipsis from "@/components/ai_components/LoadingElipsis";
import ModalUsedLimit from "@/components/ModalUsedLimit";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from '@/components/ui/Text';
import { AIBlock, blocksToHistoryContent, ChatMessage, sendChatMessage } from "@/helpers/aiChatService";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiImage } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const quickActions = [
    { id: 1, label: "Show me my this week spending summary" },
    { id: 2, label: "What are my top expenses?" },
    { id: 3, label: "How can I save more money?" },
    { id: 4, label: "Give me budgeting tips" },
    { id: 5, label: "Analyze my recent transactions" },
    { id: 6, label: "Suggest ways to reduce dining out expenses" },
    { id: 7, label: "Provide insights on my subscription services" },
];

const moreActions = [
    { id: 1, label: "Help me create a budget plan" },
    { id: 2, label: "Do I need subscription services?" },
    { id: 3, label: "Generate charts for my spending habits" },
];

interface ChatEntry {
    role: 'user' | 'assistant';
    content: string;
    blocks?: AIBlock[];
}

const width = Dimensions.get('window').width;

export default function AiMain() {
    const [inputText, setInputText] = useState('');
    const [inputFocused, setInputFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);
    const router = useRouter();
    const kbBehavior = Platform.OS === 'ios' ? 'padding' : 'height';
    const token = useAuthStore.getState().token;
    const { user, updateAiTutorialWatched, updateUsedChatLimitAt } = useUserStore();
    const [showModalUsedLimit, setShowModalUsedLimit] = useState(false);

    useEffect(() => {
        if (!user?.premium && user?.usedChatLimitAt) {
            const usedDate = new Date(user.usedChatLimitAt);
            const now = new Date();
            if (usedDate.toDateString() === now.toDateString()) {
                setShowModalUsedLimit(true);
            } else {
                updateUsedChatLimitAt(null);
            }
        }
    }, []);
    const putTutorialFlag = async () => {
        if (user?.aiTutorialWatched) return;
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/ai-tutorial-watched`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            updateAiTutorialWatched(true);
        }
        catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        putTutorialFlag();
    }, []);
    const chatStarted = chatHistory.length > 0;

    const handleSend = useCallback(async () => {
        const message = inputText.trim();
        if (!message || isLoading) return;

        setInputText('');
        Keyboard.dismiss();
        setIsLoading(true);

        const userEntry: ChatEntry = { role: 'user', content: message };
        setChatHistory(prev => [...prev, userEntry]);

        const apiHistory: ChatMessage[] = chatHistory.map(entry => ({
            role: entry.role,
            content: entry.role === 'assistant' && entry.blocks
                ? blocksToHistoryContent(entry.blocks)
                : entry.content
        }));

        try {
            const response = await sendChatMessage(message, apiHistory);
            const assistantEntry: ChatEntry = {
                role: 'assistant',
                content: JSON.stringify(response),
                blocks: response.blocks
            };
            setChatHistory(prev => [...prev, assistantEntry]);
        } catch (error: any) {
            if (error?.field === 'chatLimit') {
                updateUsedChatLimitAt(new Date().toISOString());
                setShowModalUsedLimit(true);
                setIsLoading(false);
                return;
            }
            const errorEntry: ChatEntry = {
                role: 'assistant',
                content: '',
                blocks: [{
                    type: 'error',
                    data: { message: 'Nie udało się połączyć z serwerem. Spróbuj ponownie.' }
                }]
            };
            setChatHistory(prev => [...prev, errorEntry]);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [inputText, isLoading, chatHistory]);

    const handleRetry = useCallback(() => {
        if (chatHistory.length >= 2) {
            const lastUserMessage = chatHistory[chatHistory.length - 2];
            if (lastUserMessage.role === 'user') {
                setChatHistory(prev => prev.slice(0, -2));
                setInputText(lastUserMessage.content);
                setTimeout(() => handleSend(), 100);
            }
        }
    }, [chatHistory, handleSend]);

    const handleBack = useCallback(() => {
        if (chatStarted) {
            setChatHistory([]);
        } else {
            router.push('/(tabs)');
        }
    }, [chatStarted, router]);

    return (
        <LinearGradient
            colors={["#6b5aed", "#6b5aed"]}
            start={{ x: 0.0, y: 0.5 }}
            end={{ x: 0.0, y: 0.9 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <KeyboardAvoidingView behavior={kbBehavior} style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
                        <TouchableOpacity
                            className="bg-white/10 rounded-full p-4 border border-white/30"
                            onPress={handleBack}
                        >
                            <IconSymbol name="arrow.left" color="white" size={24} weight="bold" />
                        </TouchableOpacity>
                    </View>

                    {!chatStarted ? (
                        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24 }}>
                            <MotiImage
                                source={require("@/assets/images/aibuddy4.png")}
                                className="w-72 h-72 object-contain"
                                animate={{ translateY: [-10, 0, -10] }}
                                transition={{ loop: true, type: "timing", duration: 2000 }}
                            />
                            {!inputFocused && (
                                <View style={{ flex: 1, gap: 20 }}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
                                        style={{ marginHorizontal: -24, maxHeight: 100 }}
                                    >
                                        {quickActions.map(action => (
                                            <TouchableOpacity
                                                key={action.id}
                                                className="bg-white/10 rounded-[24px] p-4 border border-white/30"
                                                style={{ maxWidth: width * 0.35 }}
                                                onPress={() => setInputText(action.label)}
                                            >
                                                <Text className="text-white font-semibold">{action.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
                                        style={{ marginHorizontal: -24, maxHeight: 100 }}
                                    >
                                        {moreActions.map(action => (
                                            <TouchableOpacity
                                                key={action.id}
                                                className="bg-white/10 rounded-[24px] p-4 border border-white/30"
                                                style={{ maxWidth: width * 0.35 }}
                                                onPress={() => setInputText(action.label)}
                                            >
                                                <Text className="text-white font-semibold">{action.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    ) : (
                        <ScrollView
                            ref={scrollViewRef}
                            style={{ flex: 1, paddingHorizontal: 24 }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="interactive"
                        >
                            {chatHistory.map((entry, index) => {
                                if (entry.role === 'user') {
                                    return (
                                        <ChatBubble key={index} isUser={true}>
                                            {entry.content}
                                        </ChatBubble>
                                    );
                                }
                                const seenTypes = new Set<string>();
                                const filteredBlocks = entry.blocks?.filter((block, idx, self) => {
                                    if (block.type === 'text') {
                                        return idx === self.findIndex((b) =>
                                            b.type === 'text' && JSON.stringify(b) === JSON.stringify(block)
                                        );
                                    } else {
                                        if (seenTypes.has(block.type)) {
                                            return false;
                                        }
                                        seenTypes.add(block.type);
                                        return true;
                                    }
                                });

                                return filteredBlocks?.map((block, blockIndex) => (
                                    <BlockRenderer
                                        key={`${index}-${blockIndex}`}
                                        block={block}
                                        onRetry={handleRetry}
                                    />
                                ));
                            })}

                            {isLoading && <LoadingElipsis />}
                        </ScrollView>
                    )}

                    <View style={{ paddingHorizontal: 24, paddingBottom: 8, paddingTop: 8 }}>
                        <View className="w-full bg-white/30 p-3 rounded-[34px] flex-row border border-white/30 items-center">
                            <TextInput
                                value={inputText}
                                onChangeText={setInputText}
                                className="flex-1 px-3 py-2 text-lg font-medium text-white"
                                style={{ fontFamily: 'Inter', maxHeight: 90 }}
                                placeholder="Write a message..."
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                multiline
                                numberOfLines={3}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                textAlignVertical="center"
                                scrollEnabled={true}
                                returnKeyType="default"
                                blurOnSubmit={false}
                            />
                            <TouchableOpacity
                                className="bg-[#6b5aed] rounded-full p-2 ml-2"
                                onPress={handleSend}
                                disabled={!inputText.trim() || isLoading}
                                style={{ opacity: inputText.trim() && !isLoading ? 1 : 0.5 }}
                            >
                                <IconSymbol name="paperplane.fill" color="white" weight="bold" size={24} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
                <ModalUsedLimit
                    visible={showModalUsedLimit}
                    onClose={() => setShowModalUsedLimit(false)}
                    type="chat"
                />
            </SafeAreaView>
        </LinearGradient>
    );
}
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/Text";
import { Goal } from "@/types";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

interface UpdateGoalModalProps {
    visible: boolean;
    onClose: () => void;
    onUpdate: (amount: number) => Promise<boolean | undefined>;
    goal?: Goal;
}

const QUICK_AMOUNTS = [1, 2, 5, 10, 20, 50, 100, 200, 500];

export default function UpdateGoalModal({ visible, onClose, onUpdate, goal }: UpdateGoalModalProps) {
    const [amount, setAmount] = useState('0.00');
    const [updatePending, setUpdatePending] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleUpdate = () => {
        Keyboard.dismiss();
        setUpdateError('');

        const numAmount = parseFloat(amount) || 0;
        const currentBalance = goal?.currentAmount || 0;
        const newBalance = currentBalance + numAmount;

        if (newBalance < 0) {
            setUpdateError('Cannot withdraw more than current balance.');
            return;
        }

        setUpdatePending(true);
        onUpdate(numAmount).then((res) => {
            if (res) {
                setAmount('0.00');
                onClose();
            } else {
                setUpdateError('Failed to update goal. Please try again.');
            }
        }).catch((err) => {
            setUpdateError(err.message);
        }).finally(() => setUpdatePending(false));
    };

    const handleQuickAmount = (quickAmount: number) => {
        const currentAmount = parseFloat(amount) || 0;
        const newAmount = currentAmount + quickAmount;
        setAmount(newAmount.toFixed(2));
    };

    const handleClose = () => {
        Keyboard.dismiss();
        setAmount('0.00');
        setUpdateError('');
        onClose();
    };

    const percent = goal && goal.amount > 0
        ? Math.min(100, Math.round((goal.currentAmount / goal.amount) * 100))
        : 0;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <TouchableWithoutFeedback onPress={() => {
                    if (keyboardVisible) {
                        Keyboard.dismiss();
                    } else {
                        handleClose();
                    }
                }}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={{ margin: 8, backgroundColor: 'white', borderRadius: 40, paddingBottom: 24, paddingTop: 24, paddingHorizontal: 24 }}>
                        <View style={{ minHeight: 300, justifyContent: updatePending ? 'center' : 'space-between' }}>
                            {updatePending ? <ActivityIndicator size="large" color="#6b5aed" /> :
                                <>
                                    <View style={{ alignItems: 'center', paddingBottom: 16 }}>
                                        <Text className="text-black text-center font-semibold text-xl">
                                            Manage funds for "{goal?.name}"
                                        </Text>
                                        {updateError &&
                                            <Text className="text-red-500 text-center">{updateError}</Text>
                                        }
                                    </View>

                                    <View className={'items-center justify-center w-full gap-2 mb-4'}>
                                        <View className={'flex flex-row items-center justify-between mb-4 w-full px-4'}>
                                            <TouchableOpacity
                                                className={'p-2 border bg-white border-gray-300 rounded-full'}
                                                onPress={() => {
                                                    const currentAmount = parseFloat(amount) || 0;
                                                    const newAmount = currentAmount - 1;
                                                    setAmount(newAmount.toFixed(2));
                                                }}
                                            >
                                                <IconSymbol name={'minus'} color={'#6b5aed'} size={28} weight={'semibold'} />
                                            </TouchableOpacity>
                                            <View className={'flex-1 items-center justify-center mx-4'}>
                                                <TextInput
                                                    className={'text-accent font-semibold text-[54px] text-center w-full'}
                                                    value={amount}
                                                    onChangeText={(text) => {
                                                        const normalized = text.replace(',', '.');
                                                        const cleaned = normalized.replace(/[^0-9.\-]/g, '');
                                                        if (cleaned.indexOf('-') > 0) return;
                                                        const parts = cleaned.replace('-', '').split('.');
                                                        if (parts.length > 2) return;
                                                        if (parts[1] && parts[1].length > 2) return;
                                                        setAmount(cleaned);
                                                    }}
                                                    keyboardType="numbers-and-punctuation"
                                                    placeholder="0.00"
                                                />
                                            </View>
                                            <TouchableOpacity
                                                className={'p-2 border bg-white border-gray-300 rounded-full'}
                                                onPress={() => {
                                                    const currentAmount = parseFloat(amount) || 0;
                                                    const newAmount = currentAmount + 1;
                                                    setAmount(newAmount.toFixed(2));
                                                }}
                                            >
                                                <IconSymbol name={'plus'} color={'#6b5aed'} size={28} weight={'semibold'} />
                                            </TouchableOpacity>
                                        </View>
                                        <Text className={'items-center justify-center text-gray-500'}>
                                            Current: <Text className={'font-semibold'}>{goal?.currentAmount?.toFixed(2) || '0.00'} zł</Text> / {goal?.amount?.toFixed(2) || '0.00'} zł ({percent}%)
                                        </Text>
                                    </View>

                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
                                    >
                                        {QUICK_AMOUNTS.map((quickAmount) => (
                                            <TouchableOpacity
                                                key={quickAmount}
                                                onPress={() => handleQuickAmount(quickAmount)}
                                                className="bg-[#ebe9fc] px-4 py-2 rounded-full"
                                            >
                                                <Text className="text-accent font-semibold">+{quickAmount}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <View style={{ gap: 12, marginTop: 16 }}>
                                        <TouchableOpacity
                                            onPress={handleUpdate}
                                            className="bg-accent rounded-full py-[14px] align-middle"
                                        >
                                            <Text className="text-white font-bold text-lg text-center">Save</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handleClose}
                                            className="bg-[#ebe9fc] rounded-full py-[14px] align-middle"
                                        >
                                            <Text className="font-bold text-lg text-accent text-center">Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

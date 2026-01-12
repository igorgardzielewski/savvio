import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/Text";
import { Goal } from "@/types";
import React from "react";
import { ActivityIndicator, Modal, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SFSymbols6_0 } from "sf-symbols-typescript";

interface DeleteGoalModalProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => Promise<boolean | undefined>;
    goal?: Goal;
}

export default function DeleteGoalModal({ visible, onClose, onDelete, goal }: DeleteGoalModalProps) {
    const [deletePending, setDeletePending] = React.useState(false);
    const [deleteError, setDeleteError] = React.useState('');

    const handleDelete = () => {
        setDeleteError('');
        setDeletePending(true);
        onDelete().then((res) => {
            if (res) {
                onClose();
            } else {
                setDeleteError('Failed to delete goal. Please try again.');
            }
        }).catch((err) => {
            setDeleteError(err.message);
        }).finally(() => setDeletePending(false));
    };

    const percent = goal && goal.amount > 0
        ? Math.min(100, Math.round((goal.currentAmount / goal.amount) * 100))
        : 0;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>

                <SafeAreaView edges={['bottom']}>
                    <View style={{ margin: 8, backgroundColor: 'white', borderRadius: 40, paddingBottom: 24, paddingTop: 24, paddingHorizontal: 24 }}>
                        <View style={{ minHeight: 200, justifyContent: deletePending ? 'center' : 'space-between' }}>
                            {deletePending ? <ActivityIndicator size="large" color="#6b5aed" /> :
                                <>
                                    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                        <Text className="text-xl font-bold text-black mb-2">Delete this goal?</Text>
                                        {deleteError ? (
                                            <Text className="text-red-500 text-center">{deleteError}</Text>
                                        ) : (
                                            <Text className="text-gray-500 text-center">This action cannot be undone</Text>
                                        )}
                                    </View>

                                    <View
                                        className="relative flex flex-col justify-between rounded-[24px] p-4 overflow-hidden shadow-sm self-center mb-4 border border-black/5"
                                        style={{
                                            backgroundColor: 'white',
                                            width: '60%',
                                            minHeight: 100
                                        }}
                                    >
                                        <View className="flex-row items-center gap-3 mb-2">
                                            <View
                                                className="w-10 h-10 rounded-full items-center justify-center"
                                                style={{ backgroundColor: goal?.color + '20' }}
                                            >
                                                <IconSymbol name={goal?.icon_sf_symbol as SFSymbols6_0} size={20} color={goal?.color || '#6b5aed'} />
                                            </View>
                                            <Text className="text-black text-lg font-bold flex-1" numberOfLines={1}>
                                                {goal?.name}
                                            </Text>
                                        </View>

                                        <View className="flex flex-row items-center bg-black/5 rounded-full w-full h-2 overflow-hidden">
                                            <View
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${percent}%`,
                                                    backgroundColor: goal?.color || '#6b5aed'
                                                }}
                                            />
                                        </View>

                                        <View className="flex flex-row items-center justify-between mt-2">
                                            <Text className="text-black/50 text-xs">{percent}% complete</Text>
                                            <Text className="text-black/50 text-xs">{goal?.currentAmount?.toFixed(0)} / {goal?.amount?.toFixed(0)} zł</Text>
                                        </View>
                                    </View>

                                    <View style={{ gap: 12 }}>
                                        <TouchableOpacity
                                            onPress={handleDelete}
                                            className="bg-danger rounded-full py-[14px] align-middle"
                                        >
                                            <Text className="text-white font-bold text-lg text-center">Delete</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={onClose}
                                            className="bg-[#ebe9fc] rounded-full py-[14px] align-middle"
                                        >
                                            <Text className="font-bold text-lg text-accent text-center">Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>}
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

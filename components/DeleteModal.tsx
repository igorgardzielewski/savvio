import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/Text";
import { BudgetCategory } from "@/types";
import React from "react";
import { ActivityIndicator, Modal, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SFSymbols6_0 } from "sf-symbols-typescript";
interface DeleteModalProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => Promise<boolean | undefined>;
    budgetCategory?: BudgetCategory
}
export default function DeleteModal({ visible, onClose, onDelete, budgetCategory }: DeleteModalProps) {
    const [deletePending, setDeletePending] = React.useState(false);
    const [deleteError, setDeleteError] = React.useState('');
    const handleDelete = () => {
        setDeleteError('');
        setDeletePending(true);
        onDelete().then((res) => {
            if (res) {
                onClose();
            }
            else setDeleteError('Failed to delete category. Please try again.');
        }
        ).catch((err) => {
            setDeleteError(err.message);
        }).finally(() => setDeletePending(false));
    }
    const percentageSpent = budgetCategory ? (budgetCategory?.spent / budgetCategory?.allocated * 100) : 0;
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => onClose()}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <TouchableWithoutFeedback onPress={() => onClose()}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>

                <SafeAreaView edges={['bottom']}>
                    <View style={{ margin: 8, backgroundColor: 'white', borderRadius: 40, paddingBottom: 24, paddingTop: 24, paddingHorizontal: 24 }}>
                        <View style={{ minHeight: 200, justifyContent: deletePending ? 'center' : 'space-between' }}>
                            {deletePending ? <ActivityIndicator size="large" color="#6b5aed" /> :
                                <>
                                    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                        <Text className="text-xl font-bold text-black mb-2">You are about to delete category?</Text>
                                        {deleteError ? <Text className="text-red-500 text-center">{deleteError}</Text> : <Text className="text-gray-500 text-center">This action cannot be undone</Text>}
                                    </View>
                                    <View
                                        key={budgetCategory?.id}
                                        className="relative flex flex-col justify-between rounded-[24px] p-4 overflow-hidden shadow-sm self-center mb-4"
                                        style={{
                                            backgroundColor: budgetCategory?.color,
                                            width: '48%',
                                            minHeight: 140
                                        }}
                                    >
                                        <View>
                                            <Text className="text-white font-bold text-xl">
                                                {budgetCategory?.name}
                                            </Text>
                                            <Text className="text-white/70 text-sm mt-1">
                                                {percentageSpent.toFixed(0)}% used
                                            </Text>
                                        </View>

                                        <View className="flex flex-row items-end justify-end">
                                            <View className=" mr-2">
                                                <Text className="text-white font-semibold text-sm">
                                                    {budgetCategory?.spent.toFixed(0)} zł
                                                </Text>
                                                <Text className="text-white/70 text-xs">
                                                    of {budgetCategory?.allocated.toFixed(0)} zł
                                                </Text>
                                            </View>
                                            <View className="w-2 h-16 bg-white rounded-full overflow-hidden border border-white">
                                                <View
                                                    className="w-full bg-red-500/70 rounded-full"
                                                    style={{
                                                        height: `${percentageSpent}%`,
                                                        alignSelf: 'flex-end',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                    }}
                                                />
                                            </View>
                                        </View>

                                        <View className="absolute left-[-16px] bottom-[-8px]">
                                            <IconSymbol
                                                name={budgetCategory?.iconUri as SFSymbols6_0}
                                                size={64}
                                                color="white"
                                                style={{ opacity: 0.4 }}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ gap: 12 }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                handleDelete()
                                            }}
                                            className="bg-danger rounded-full py-[14px] align-middle"
                                        >
                                            <Text className="text-white font-bold text-lg text-center">Delete</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => onClose()}
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
    )
}
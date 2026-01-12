import React, {useCallback, useEffect, useState} from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform, ActivityIndicator,
    TouchableWithoutFeedback
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SFSymbols6_0 } from "sf-symbols-typescript";
import {useAuthStore} from "@/store/authStore";
import {useUserStore} from "@/store/userStore";
import {BudgetCategoryResponse} from "@/types";
import {SafeAreaView} from "react-native-safe-area-context";
import {randomInt} from "node:crypto";

const availableIcons: SFSymbols6_0[] = [
    "car", "house", "bag", "tshirt", "cart",
    "creditcard", "takeoutbag.and.cup.and.straw",
    "gamecontroller", "cross.case", "airplane",
    "fork.knife", "gift", "laptopcomputer", "heart",
    "camera.aperture", "ticket"
];

const colors = [
    "#6b5aed",  // Fioletowy (główny kolor aplikacji)
    "#16c47f",  // Zielony (z karty "You saved")
    "#f87171",  // Czerwony (z transakcji)
    "#ffcc4d",  // Żółty (z progress bara)
    "#ff6b9d",  // Różowy
    "#4f46e5",  // Ciemny fiolet
    "#10b981",  // Szmaragdowy
    "#f59e0b",  // Pomarańczowy
    "#ef4444",  // Jasny czerwony
    "#8b5cf6",  // Lawendowy
    "#06b6d4",  // Cyan
    "#ec4899",  // Magenta
];

interface BudgetCategoryModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function BudgetCategoryModal({
                                                visible,
                                                onClose,
                                            }: BudgetCategoryModalProps) {
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryAmount, setNewCategoryAmount] = useState("");
    const [selectedIcon, setSelectedIcon] = useState<SFSymbols6_0>("cart");
    const [selectedColor, setSelectedColor] = useState("#72c7aa");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const {token} = useAuthStore();
    const {setCurrentBudget,user} = useUserStore();
    useEffect(() => {
        resetForm();
    }, [visible]);
    const onChangeCategoryName = useCallback((text:string) => {
        setNewCategoryName(text);
    }, []);
    const onChangeCategoryAmount = useCallback((text:string) => {
        setNewCategoryAmount(text);
    }, []);
    const handleAddBudgetCategory = async() => {
        setErrorMessage("");
        if(!newCategoryName.trim()) {
            Alert.alert("Error", "Please enter a category name");
            return;
        }
        if(!newCategoryAmount.trim() || isNaN(Number(newCategoryAmount)) || Number(newCategoryAmount) <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }
        try {
            setLoading(true);
            const data = {
                name: newCategoryName,
                iconUri: selectedIcon,
                color: selectedColor,
                allocated: parseFloat(newCategoryAmount),
            };
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/budgetUser/category/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if(res.ok) {
                const createdCategory = await res.json() as BudgetCategoryResponse;
                const cat = createdCategory?.budgetCategory;
                if(!cat) {
                    setErrorMessage('Invalid category data received');
                    console.warn('Invalid category payload', createdCategory);
                } else {
                    const currentBudget = user?.currentBudget;
                    const updatedCategories = currentBudget?.budgetCategories ? [...currentBudget.budgetCategories, cat] : [cat];
                    setCurrentBudget({
                        ...(currentBudget || {}),
                        budgetLimit: createdCategory.budgetLimit,
                        spent: currentBudget?.spent ?? 0,
                        budgetCategories: updatedCategories,
                    });
                    onClose();
                    resetForm();
                }
            } else {
                setErrorMessage("Failed to add budget category");
                Alert.alert("Error", "Failed to add budget category");
            }
        }
        catch (error) {
            setErrorMessage("Failed to add budget category");
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    }
    const resetForm = () => {
        setNewCategoryName("");
        setNewCategoryAmount("");
        setSelectedIcon("cart");
        setSelectedColor("#72c7aa");
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 justify-end">
                    {/* Backdrop as sibling to avoid capturing inner gestures */}
                    <TouchableWithoutFeedback onPress={onClose}>
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                    </TouchableWithoutFeedback>

                    {/* Bottom sheet content */}
                    <View
                        className="bg-white rounded-[40px] pt-6 m-2"
                        style={{ maxHeight: '90%' }}
                    >
                        <View className="items-center px-6">
                            <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-4" />
                            <Text className="text-xl font-bold mb-6">
                                Add New Budget Category
                            </Text>
                        </View>
                        {loading ? (
                            <View className={'h-[200px] justify-center items-center'}>
                                <ActivityIndicator color={'#6b5aed'} size={"large"} />
                            </View>
                        ) : (
                            <>
                            <ScrollView
                                className="px-6"
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                nestedScrollEnabled
                                directionalLockEnabled
                                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                            >
                                <View className="gap-4 pb-6">
                                    {errorMessage && <Text className={'text-danger text-lg text-center'}>{errorMessage}</Text>}
                        <View>
                            <Text className="text-sm text-gray-500 mb-1">Category Name</Text>
                            <TextInput
                                className="bg-gray-100 rounded-[16px] text-black"
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 12,
                                    fontSize: 16,
                                    lineHeight: 22,
                                }}
                                placeholder="e.g. Rent, Groceries, Transport"
                                value={newCategoryName}
                                onChangeText={onChangeCategoryName}
                            />
                        </View>
                        <View>
                            <Text className="text-sm text-gray-500 mb-1">Budget Amount (zł)</Text>
                            <TextInput
                                className="bg-gray-100 rounded-[16px] text-black"
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 12,
                                    fontSize: 16,
                                    lineHeight: 22,
                                }}
                                placeholder="1000"
                                keyboardType="numeric"
                                value={newCategoryAmount}
                                onChangeText={onChangeCategoryAmount}
                            />
                        </View>

                        <View>
                            <Text className="text-sm text-gray-500 mb-2">Choose an icon</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className={'-mx-4'}>
                                <View className="flex-row gap-2 pb-2">
                                    {availableIcons.map((icon) => (
                                        <TouchableOpacity
                                            key={icon}
                                            className={`p-3 rounded-full ${
                                                selectedIcon === icon ? 'bg-[#6b5aed]' : 'bg-gray-200'
                                            }`}
                                            onPress={() => setSelectedIcon(icon)}
                                        >
                                            <IconSymbol
                                                name={icon}
                                                size={24}
                                                color={selectedIcon === icon ? 'white' : '#6b5aed'}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        <View>
                            <Text className="text-sm text-gray-500 mb-2">Choose a color</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className={'-mx-4'} >
                                <View className="flex-row gap-2 pb-2">
                                    {colors.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            className={`p-1 rounded-full ${
                                                selectedColor === color ? 'border-2 border-[#6b5aed]' : ''
                                            }`}
                                            onPress={() => setSelectedColor(color)}
                                        >
                                            <View
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 18,
                                                    backgroundColor: color,
                                                }}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                                    <View
                                        className="relative flex flex-col justify-between rounded-[24px] p-4 overflow-hidden shadow-sm self-center mb-4"
                                        style={{
                                            backgroundColor: selectedColor,
                                            width: '48%',
                                            minHeight: 140
                                        }}
                                    >
                                        <View>
                                            <Text className="text-white font-bold text-xl">
                                                {newCategoryName || 'Title'}
                                            </Text>
                                            <Text className="text-white/70 text-sm mt-1">
                                                0 % used
                                            </Text>
                                        </View>

                                        <View className="flex flex-row items-end justify-end">
                                            <View className=" mr-2">
                                                <Text className="text-white font-semibold text-sm">
                                                    0 zł
                                                </Text>
                                                <Text className="text-white/70 text-xs">
                                                    of {newCategoryAmount || 1000} zł
                                                </Text>
                                            </View>
                                            <View className="w-2 h-16 bg-white rounded-full overflow-hidden border border-white">
                                                <View
                                                    className="w-full bg-red-500/70 rounded-full"
                                                    style={{
                                                        height: `0%`,
                                                        alignSelf: 'flex-end',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                    }}
                                                />
                                            </View>
                                        </View>

                                        <View className="absolute left-[-16px] bottom-[-8px]">
                                            <IconSymbol
                                                name={selectedIcon as SFSymbols6_0}
                                                size={64}
                                                color="white"
                                                style={{ opacity: 0.4 }}
                                            />
                                        </View>
                                    </View>
                        </View>
                        </ScrollView>
                            <SafeAreaView edges={['bottom']} className="flex-row gap-3 mb-4 px-6 py-2">
                                <TouchableOpacity
                                    className="flex-1 bg-gray-200 py-4 rounded-full"
                                    onPress={onClose}
                                >
                                    <Text className="text-center font-bold text-gray-700">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 bg-[#6b5aed] py-4 rounded-full"
                                    onPress={handleAddBudgetCategory}
                                >
                                    <Text className="text-center font-bold text-white">
                                        Add Category
                                    </Text>
                                </TouchableOpacity>
                            </SafeAreaView>
                    </>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
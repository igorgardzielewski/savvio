
import { IconSymbol } from "@/components/ui/icon-symbol";
import { goalsApi } from "@/helpers/goalsApi";
import { formatMonthYear } from "@/helpers/timeHelper";
import { useUserStore } from "@/store/userStore";
import { Goal } from "@/types";
import dayjs from 'dayjs';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, { DateType, useDefaultStyles } from "react-native-ui-datepicker";
import { SFSymbols6_0 } from "sf-symbols-typescript";

const availableIcons: SFSymbols6_0[] = [
    "car", "house", "bag", "tshirt", "cart",
    "creditcard", "takeoutbag.and.cup.and.straw",
    "gamecontroller", "cross.case", "airplane",
    "fork.knife", "gift", "laptopcomputer", "heart",
    "camera.aperture", "ticket", "graduationcap", "globe", "bicycle"
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

interface AddGoalModalProps {
    visible: boolean;
    onClose: () => void;
    goal?: Goal | null;
}

export default function AddGoalModal({
    visible,
    onClose,
    goal,
}: AddGoalModalProps) {
    const [goalName, setGoalName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("0");
    const [selectedIcon, setSelectedIcon] = useState<SFSymbols6_0>("target");
    const [selectedColor, setSelectedColor] = useState("#6b5aed");
    const [loading, setLoading] = useState(false);

    const today = new Date();
    const [startDate, setStartDate] = useState<DateType>(today);
    const [endDate, setEndDate] = useState<DateType>(dayjs(today).add(1, 'year'));
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const defaultStyles = useDefaultStyles();

    const { addGoal, updateGoal, user } = useUserStore();

    useEffect(() => {
        if (visible) {
            if (goal) {
                setGoalName(goal.name);
                setTargetAmount(goal.amount.toString());
                setCurrentAmount(goal.currentAmount.toString());
                setSelectedIcon(goal.icon_sf_symbol as SFSymbols6_0);
                setSelectedColor(goal.color);
                setStartDate(dayjs(goal.startDate));
                setEndDate(dayjs(goal.endDate));
            } else {
                resetForm();
            }
        }
    }, [visible, goal]);

    const handleAddGoal = async () => {
        if (!goalName.trim()) {
            Alert.alert("Error", "Please enter a goal name");
            return;
        }
        if (!targetAmount.trim() || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
            Alert.alert("Error", "Please enter a valid target amount");
            return;
        }
        if (isNaN(Number(currentAmount)) || Number(currentAmount) < 0) {
            Alert.alert("Error", "Please enter a valid saved amount");
            return;
        }

        try {
            setLoading(true);

            const goalData = {
                name: goalName,
                amount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount) || 0,
                icon_sf_symbol: selectedIcon,
                color: selectedColor,
                startDate: dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss'),
                endDate: dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss'),
            };

            if (goal) {
                // Edit mode - update existing goal
                const updatedGoal = await goalsApi.updateGoal(goal.id, goalData);
                updateGoal(goal.id, updatedGoal);
            } else {
                // Create mode - add new goal
                const newGoal = await goalsApi.createGoal(goalData);
                addGoal(newGoal);
            }

            onClose();
            resetForm();
        }
        catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.message || "Failed to save goal");
        }
        finally {
            setLoading(false);
        }
    }

    const resetForm = () => {
        setGoalName("");
        setTargetAmount("");
        setCurrentAmount("0");
        setSelectedIcon("target");
        setSelectedColor("#6b5aed");
        const today = new Date();
        setStartDate(today);
        setEndDate(dayjs(today).add(1, 'year'));
        setIsCalendarOpen(false);
    };

    const percent = targetAmount && !isNaN(Number(targetAmount)) && Number(targetAmount) > 0
        ? Math.min(100, Math.round((Number(currentAmount || 0) / Number(targetAmount)) * 100))
        : 0;

    const formatDateRange = () => {
        if (!endDate) return 'Select date range';
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`;
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
                    <TouchableWithoutFeedback onPress={onClose}>
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                    </TouchableWithoutFeedback>

                    <View
                        className="bg-white rounded-[40px] pt-6 m-2"
                        style={{ maxHeight: '90%' }}
                    >
                        <View className="items-center px-6">
                            <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-4" />
                            <Text className="text-xl font-bold mb-6">
                                Create New Goal
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
                                >
                                    <View className="gap-4 pb-6">
                                        <View
                                            className="relative flex flex-col justify-between rounded-[24px] p-4 overflow-hidden shadow-sm self-center mb-4 border border-black/5"
                                            style={{
                                                backgroundColor: 'white',
                                                width: '100%',
                                                minHeight: 140
                                            }}
                                        >
                                            <View className="flex-row items-center gap-3 mb-2">
                                                <View
                                                    className="w-10 h-10 rounded-full items-center justify-center"
                                                    style={{ backgroundColor: selectedColor + '20' }}
                                                >
                                                    <IconSymbol name={selectedIcon} size={20} color={selectedColor} />
                                                </View>
                                                <Text className="text-black text-lg font-bold flex-1" numberOfLines={1}>
                                                    {goalName || 'Goal Name'}
                                                </Text>
                                            </View>

                                            <View className="flex flex-col flex-1 justify-end mt-2">
                                                <View className="relative mb-6">
                                                    <View
                                                        style={{
                                                            left: `${Math.max(5, Math.min(95, percent))}%`,
                                                            transform: [{ translateX: -20 }]
                                                        }}
                                                        className="absolute -top-7 items-center"
                                                    >
                                                        <View
                                                            className="px-2 py-0.5 rounded-md bg-[#1a1a2e]"
                                                        >
                                                            <Text className="text-white text-[10px] font-bold">
                                                                {percent}%
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={{
                                                                width: 0,
                                                                height: 0,
                                                                borderLeftWidth: 4,
                                                                borderRightWidth: 4,
                                                                borderTopWidth: 4,
                                                                borderLeftColor: 'transparent',
                                                                borderRightColor: 'transparent',
                                                                borderTopColor: '#1a1a2e',
                                                            }}
                                                        />
                                                    </View>

                                                    <View className="flex flex-row items-center bg-black/5 rounded-full w-full h-2 overflow-hidden">
                                                        <View
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${percent}%`,
                                                                backgroundColor: selectedColor
                                                            }}
                                                        />
                                                    </View>
                                                </View>

                                                <View className="flex flex-row items-center justify-between">
                                                    <Text className="text-black/50 text-xs">{formatMonthYear(dayjs(startDate).format('YYYY-MM-DD'))}</Text>
                                                    <Text className="text-black/50 text-xs">{endDate ? formatMonthYear(dayjs(endDate).format('YYYY-MM-DD')) : 'Select end date'}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View>
                                            <Text className="text-sm text-gray-500 mb-1">Goal Name</Text>
                                            <TextInput
                                                className="bg-gray-100 rounded-[16px] text-black"
                                                style={{
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 12,
                                                    fontSize: 16,
                                                }}
                                                placeholder="e.g. New Car, Dream Vacation"
                                                value={goalName}
                                                onChangeText={setGoalName}
                                            />
                                        </View>

                                        <View className="flex-row gap-2">
                                            <View className="flex-1">
                                                <Text className="text-sm text-gray-500 mb-1">Target (zł)</Text>
                                                <TextInput
                                                    className="bg-gray-100 rounded-[16px] text-black"
                                                    style={{
                                                        paddingHorizontal: 12,
                                                        paddingVertical: 12,
                                                        fontSize: 16,
                                                    }}
                                                    placeholder="5000"
                                                    keyboardType="numeric"
                                                    value={targetAmount}
                                                    onChangeText={setTargetAmount}
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-sm text-gray-500 mb-1">Saved (zł)</Text>
                                                <TextInput
                                                    className="bg-gray-100 rounded-[16px] text-black"
                                                    style={{
                                                        paddingHorizontal: 12,
                                                        paddingVertical: 12,
                                                        fontSize: 16,
                                                    }}
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    value={currentAmount}
                                                    onChangeText={setCurrentAmount}
                                                />
                                            </View>
                                        </View>

                                        <View>
                                            <Text className="text-sm text-gray-500 mb-1">Goal Period</Text>
                                            <View className={`bg-white ${isCalendarOpen ? 'rounded-[28px]' : 'rounded-[16px]'} border border-gray-200`}>
                                                {isCalendarOpen ? (
                                                    <>
                                                        <DateTimePicker
                                                            mode="range"
                                                            className="bg-white rounded-[34px] p-4"
                                                            navigationPosition="right"
                                                            startDate={startDate}
                                                            endDate={endDate}
                                                            onChange={(params) => {
                                                                setStartDate(params.startDate || today);
                                                                setEndDate(params.endDate);
                                                            }}
                                                            disableMonthPicker={false}
                                                            disableYearPicker={false}
                                                            styles={{
                                                                ...defaultStyles,
                                                                day_cell: { marginVertical: 2 },
                                                                selected: { backgroundColor: '#6b5aed', borderRadius: 1000 },
                                                                selected_label: { color: 'white' },
                                                                range_start_label: { color: 'white' },
                                                                range_middle_label: { color: 'white' },
                                                                range_end_label: { color: 'white' },
                                                                button_next: {
                                                                    backgroundColor: 'white',
                                                                    padding: 8,
                                                                    borderRadius: 1000,
                                                                    shadowColor: '#000',
                                                                    shadowOffset: { width: 0, height: 2 },
                                                                    shadowOpacity: 0.1,
                                                                    shadowRadius: 4,
                                                                    elevation: 3,
                                                                },
                                                                range_fill_weekstart: { borderTopLeftRadius: 1000, borderBottomLeftRadius: 1000 },
                                                                range_fill_weekend: { borderTopRightRadius: 1000, borderBottomRightRadius: 1000 },
                                                                range_fill: { backgroundColor: '#7e6fe6', color: 'white' },
                                                                button_prev: {
                                                                    backgroundColor: 'white',
                                                                    padding: 8,
                                                                    borderRadius: 1000,
                                                                    shadowColor: '#000',
                                                                    shadowOffset: { width: 0, height: 2 },
                                                                    shadowOpacity: 0.1,
                                                                    shadowRadius: 4,
                                                                    elevation: 3,
                                                                },
                                                            }}
                                                        />
                                                        <View className="px-4 pb-4">
                                                            <TouchableOpacity
                                                                className="bg-[#6b5aed] px-4 py-3 rounded-full self-end"
                                                                onPress={() => setIsCalendarOpen(false)}
                                                            >
                                                                <Text className="text-white font-semibold">Save</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </>
                                                ) : (
                                                    <TouchableOpacity
                                                        className="flex flex-row w-full items-center p-3 justify-between"
                                                        onPress={() => setIsCalendarOpen(true)}
                                                    >
                                                        <IconSymbol name="calendar" color="#6B7280" size={20} />
                                                        <Text className={`${endDate ? 'text-black' : 'text-gray-400'} font-medium flex-1 ml-2`}>
                                                            {formatDateRange()}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>

                                        <View>
                                            <Text className="text-sm text-gray-500 mb-2">Choose an icon</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className={'-mx-4'}>
                                                <View className="flex-row gap-2 pb-2 pl-4">
                                                    {availableIcons.map((icon) => (
                                                        <TouchableOpacity
                                                            key={icon}
                                                            className={`p-3 rounded-full ${selectedIcon === icon ? 'bg-[#6b5aed]' : 'bg-gray-200'
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
                                                <View className="flex-row gap-2 pb-2 pl-4">
                                                    {colors.map((color) => (
                                                        <TouchableOpacity
                                                            key={color}
                                                            className={`p-1 rounded-full ${selectedColor === color ? 'border-2 border-[#6b5aed]' : ''
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
                                        onPress={handleAddGoal}
                                    >
                                        <Text className="text-center font-bold text-white">
                                            Create Goal
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

import { Text } from "@/components/ui/Text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import dayjs from 'dayjs';
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";
import DateTimePicker, { DateType, useDefaultStyles } from "react-native-ui-datepicker";

interface BudgetCreateModalProps {
    visible: boolean;
    onClose: () => void;
    editMode?: boolean;
}

export default function BudgetCreateModal({ editMode, visible, onClose }: BudgetCreateModalProps) {
    const today = new Date();
    const currentBudgetDateStart = useUserStore(state => state?.user?.currentBudget?.dateStart ?? null);
    const currentBudgetDateEnd = useUserStore(state => state?.user?.currentBudget?.dateEnd ?? null);
    const [startDate, setStartDate] = useState<DateType>(editMode ? dayjs(currentBudgetDateStart) : today);
    const [endDate, setEndDate] = useState<DateType>(editMode ? dayjs(currentBudgetDateEnd) : undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [takeOldBudget, setTakeOldBudget] = useState(false);
    const [useAI, setUseAI] = useState(false);
    const defaultStyles = useDefaultStyles();
    const [loading, setLoading] = useState(false);
    const { token } = useAuthStore();
    const { setCurrentBudget, updateCurrentBudgetDateEnd } = useUserStore();

    const [error, setError] = useState<string | null>(null);
    const handleCreateBudget = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/budgetUser/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    dateEnd: endDate,
                    takeOldBudget,
                    useAI,
                })
            })
            if (res.ok) {
                console.log('Budget created successfully');
                const budget = await res.json();
                setCurrentBudget(budget);
                onClose();
            } else {
                setError('Failed to create budget');
                console.log(res);
            }
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setLoading(false);
        }
    }
    const handleEditBudget = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/budgetUser/edit/budget`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    dateEnd: endDate,
                })
            })
            if (res.ok) {
                const budget = await res.json();
                updateCurrentBudgetDateEnd(budget.dateEnd);
                onClose();
            } else {
                setError('Failed to create budget');
                console.log(res);
            }
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setLoading(false);
        }
    }
    const formatDateRange = () => {
        if (!endDate) return 'Select date range';
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`;
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View
                    style={[
                        styles.modalContent,
                    ]}
                >
                    <Text className={'font-bold text-2xl text-heading'}>{editMode ? 'Edit current budget' : 'Create new budget'}</Text>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 24, paddingBottom: 16 }}
                    >
                        <View className={`bg-white ${isCalendarOpen ? 'rounded-[34px]' : 'rounded-[24px]'} border-2 border-gray-200`}>
                            {isCalendarOpen ? (
                                <>
                                    <DateTimePicker
                                        mode="range"
                                        className={'bg-white rounded-[34px] p-4'}
                                        navigationPosition={'right'}
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChange={(params) => {
                                            setEndDate(params.endDate);
                                        }}
                                        disableMonthPicker={true}
                                        disableYearPicker={true}
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
                                    <View className={'px-4 pb-4'}>
                                        <TouchableOpacity
                                            className={'bg-accent px-4 py-3 rounded-full self-end'}
                                            onPress={() => setIsCalendarOpen(false)}
                                        >
                                            <Text className={'text-white font-semibold'}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <TouchableOpacity
                                    className="flex flex-row w-full items-center p-6"
                                    onPress={() => setIsCalendarOpen(true)}
                                >
                                    <View className={'flex flex-row items-center justify-between w-full'}>
                                        <IconSymbol name={'calendar'} color={'#6B7280'} weight={'bold'} size={24} />
                                        <Text className={`${endDate ? 'text-black' : 'text-heading'} font-medium text-lg`}>
                                            {formatDateRange()}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                        {!editMode && (
                            <>
                                <View className={'bg-white p-6 rounded-[24px] border-2 border-gray-200 gap-4 flex-col flex'}>
                                    <View className={'flex flex-row items-center justify-between'}>
                                        <View className={'flex flex-col'}>
                                            <Text className={'font-medium text-heading text-lg'}>Take Old Budget</Text>
                                            <Text className={'text-headingMeta text-sm'}>Use categories from previous budget</Text>
                                        </View>
                                        <Switch
                                            trackColor={{ false: "#d1d5db", true: "#6b5aed" }}
                                            thumbColor={takeOldBudget ? "#ffffff" : "#f4f3f4"}
                                            ios_backgroundColor="#d1d5db"
                                            onValueChange={(value) => {
                                                setTakeOldBudget(value);
                                                if (value) setUseAI(false);
                                            }}
                                            value={takeOldBudget}
                                        />
                                    </View>
                                </View>

                                {/* <View className={'bg-white p-6 rounded-[24px] border-2 border-gray-200 gap-4 flex-col flex'}>
                                <View className={'flex flex-row items-center justify-between'}>
                                    <View className={'flex flex-col'}>
                                        <Text className={'font-medium text-heading text-lg'}>Use AI</Text>
                                        <Text className={'text-headingMeta text-sm'}>Let AI suggest budget categories</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: "#d1d5db", true: "#6b5aed" }}
                                        thumbColor={useAI ? "#ffffff" : "#f4f3f4"}
                                        ios_backgroundColor="#d1d5db"
                                        onValueChange={(value) => {
                                            setUseAI(value);
                                            if (value) setTakeOldBudget(false);
                                        }}
                                        value={useAI}
                                    />
                                </View>
                            </View> */}
                            </>
                        )}
                        <View className={'flex flex-col items-center w-full gap-4'}>
                            {error && <Text className={'text-sm text-danger'}>{error}</Text>}
                            <TouchableOpacity className={`${!endDate ? 'bg-accent/30' : 'bg-accent'} px-4 py-4 rounded-full w-full mb-4`} onPress={editMode ? handleEditBudget : handleCreateBudget} disabled={!endDate || loading}>
                                {loading ? (<ActivityIndicator color="white" />
                                ) : (<Text className={'font-semibold text-white text-xl text-center'}>{editMode ? 'Update' : 'Create'}</Text>)}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        gap: 24,
        display: 'flex',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        maxHeight: '85%',
        minHeight: 200,
    },
});

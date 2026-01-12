import AddGoalModal from '@/components/goals/AddGoalModal';
import DeleteGoalModal from '@/components/goals/DeleteGoalModal';
import UpdateGoalModal from '@/components/goals/UpdateGoalModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { goalsApi } from '@/helpers/goalsApi';
import { formatMonthYear } from '@/helpers/timeHelper';
import { useUserStore } from '@/store/userStore';
import { Goal } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SFSymbols6_0 } from 'sf-symbols-typescript';

const CompletedMilestone = () => (
    <View className="bg-green-100 rounded-full p-2">
        <IconSymbol name="plus.circle.fill" color={'#68d391'} weight="semibold" size={24} />
    </View>
);

const FutureMilestone = () => (
    <View className="bg-red-100 rounded-full p-2">
        <IconSymbol name="minus.circle.fill" color="#fc8181" weight="semibold" size={24} />
    </View>
);

export default function GoalsScreen() {
    const router = useRouter();
    const { user, removeGoal, updateGoal } = useUserStore();
    const [addGoalModalVisible, setAddGoalModalVisible] = useState(false);
    const [deleteGoalModalVisible, setDeleteGoalModalVisible] = useState(false);
    const [updateGoalModalVisible, setUpdateGoalModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [editGoal, setEditGoal] = useState<Goal | null>(null);
    const [goalHeights, setGoalHeights] = useState<{ [key: number]: number }>({});
    const [expandedGoal, setExpandedGoal] = useState<{ [key: number]: boolean }>({});
    const refLeftColumn = useRef<View>(null);
    const refRightColumn = useRef<View>(null);

    const goals = user?.goals || [];

    const { leftHeight, rightHeight } = useMemo(() => {
        let left = 0;
        let right = 0;

        goals.forEach((goal, index) => {
            const height = goalHeights[goal.id] || 180;
            if (index % 2 === 0) {
                left += height;
            } else {
                right += height;
            }
        });

        return { leftHeight: left, rightHeight: right };
    }, [goals, goalHeights]);

    const handleLongPress = (goal: Goal) => {
        setSelectedGoal(goal);
        setDeleteGoalModalVisible(true);
    };

    const handleDeleteGoal = async (): Promise<boolean | undefined> => {
        if (!selectedGoal) return false;
        try {
            await goalsApi.deleteGoal(selectedGoal.id);
            removeGoal(selectedGoal.id);
            return true;
        } catch (error) {
            console.error('Failed to delete goal:', error);
            return false;
        }
    };

    const handleUpdateGoal = async (amount: number): Promise<boolean | undefined> => {
        if (!selectedGoal) return false;
        try {
            const updatedGoal = await goalsApi.depositGoal(selectedGoal.id, {
                amount,
                note: amount >= 0 ? 'Deposit' : 'Withdrawal'
            });
            updateGoal(selectedGoal.id, updatedGoal);

            setGoalHistories(prev => {
                const newHistories = { ...prev };
                delete newHistories[selectedGoal.id];
                return newHistories;
            });
            const history = await goalsApi.fetchGoalHistory(selectedGoal.id);
            setGoalHistories(prev => ({ ...prev, [selectedGoal.id]: history }));

            return true;
        } catch (error) {
            console.error('Failed to update goal:', error);
            return false;
        }
    };

    const handleEditGoal = (goal: Goal) => {
        setEditGoal(goal);
        setAddGoalModalVisible(true);
    };

    const handleOpenUpdate = (goal: Goal) => {
        setSelectedGoal(goal);
        setUpdateGoalModalVisible(true);
    };

    const [goalHistories, setGoalHistories] = useState<{ [key: number]: any[] }>({});
    const [historyLoading, setHistoryLoading] = useState<{ [key: number]: boolean }>({});

    const fetchGoalHistory = async (goalId: number) => {
        if (goalHistories[goalId]) return;

        setHistoryLoading(prev => ({ ...prev, [goalId]: true }));
        try {
            const history = await goalsApi.fetchGoalHistory(goalId);
            setGoalHistories(prev => ({ ...prev, [goalId]: history }));
        } catch (error) {
            console.error('Failed to fetch goal history:', error);
            setGoalHistories(prev => ({ ...prev, [goalId]: [] }));
        } finally {
            setHistoryLoading(prev => ({ ...prev, [goalId]: false }));
        }
    };

    const handleToggleExpanded = (goalId: number) => {
        const newExpanded = !expandedGoal[goalId];
        setExpandedGoal(prev => ({
            ...prev,
            [goalId]: newExpanded
        }));

        if (newExpanded) {
            fetchGoalHistory(goalId);
        }
    };

    const renderGoalHistory = (goal: Goal) => {
        const history = goalHistories[goal.id] || [];
        const isLoading = historyLoading[goal.id];

        if (isLoading) {
            return (
                <View className="items-center justify-center py-4">
                    <Text className="text-black/50 text-sm">Loading history...</Text>
                </View>
            );
        }

        if (history.length === 0) {
            return (
                <View className="items-center justify-center py-4">
                    <Text className="text-black/50 text-sm">No history yet</Text>
                </View>
            );
        }

        const formatDate = (dateStr: string) => {
            const date = new Date(dateStr);
            return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        };

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                <View className="flex-row items-start mt-4">
                    {history.map((entry, index) => (
                        <React.Fragment key={entry.id}>
                            {index > 0 && (
                                <View
                                    className="w-10 h-[2px] mt-[19px]"
                                    style={{ backgroundColor: entry.amount >= 0 ? '#68d391' + '50' : '#fc8181' + '50' }}
                                />
                            )}
                            <View className="flex-col items-center">
                                {entry.amount >= 0 ? (
                                    <CompletedMilestone />
                                ) : (
                                    <FutureMilestone />
                                )}
                                <View className="flex-col justify-center items-center">
                                    <Text className={`text-xs font-semibold mt-1 ${entry.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {entry.amount >= 0 ? '+' : ''}{entry.amount.toFixed(0)}
                                    </Text>
                                    <Text className="text-black/50 text-[8px] mt-1">
                                        {formatDate(entry.createdAt)}
                                    </Text>
                                </View>
                            </View>
                        </React.Fragment>
                    ))}
                </View>
            </ScrollView>
        );
    };

    return (
        <LinearGradient
            colors={['#f2f0ff', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.6 }}
            style={styles.gradient}
            className="flex-1"
        >
            <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
                <View className="flex-row items-center gap-4 px-4 justify-betwee mb-2">
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity onPress={() => router.push('/(tabs)')} className="rounded-full p-4 bg-white">
                            <IconSymbol name={'arrow.left'} size={24} color={'#6b5aed'} />
                        </TouchableOpacity>
                        <Text className="text-[#120f29] text-3xl font-semibold">Goals</Text>
                    </View>
                </View>
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        height: '100%',
                        paddingHorizontal: 16,
                        paddingBottom: 100,
                        gap: 24,
                    }}
                    showsVerticalScrollIndicator={false}
                >


                    {goals.length === 0 ? (
                        <View className="flex-1 flex-col items-center justify-center px-6">
                            <IconSymbol name="target" size={80} color="#d1d5db" style={{ marginBottom: 20 }} />
                            <Text className="text-gray-500 text-lg text-center mb-2">
                                No goals yet
                            </Text>
                            <Text className="text-gray-400 text-sm text-center mb-8">
                                Start saving for your dreams by creating your first goal
                            </Text>
                            <TouchableOpacity
                                className="bg-[#6b5aed] px-8 py-4 rounded-full"
                                onPress={() => setAddGoalModalVisible(true)}
                            >
                                <Text className="text-white font-bold text-lg">Create Goal</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="gap-4">
                            {goals.map((goal) => {
                                const rawPercent = goal.amount && !isNaN(Number(goal.amount)) && Number(goal.amount) > 0
                                    ? (Number(goal.currentAmount || 0) / Number(goal.amount)) * 100
                                    : 0;
                                const percent = rawPercent === 0 ? 0 : Math.max(0.01, Math.min(100, rawPercent));
                                const displayPercent = rawPercent === 0 ? '0' :
                                    rawPercent < 0.01 ? '0.01' :
                                        rawPercent < 1 ? rawPercent.toFixed(2) :
                                            Math.round(rawPercent).toString();

                                return (
                                    <View
                                        key={goal.id}
                                        className="overflow-hidden shadow-sm border border-black/5"
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: 24,
                                        }}
                                    >
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => handleToggleExpanded(goal.id)}
                                            onLongPress={() => handleLongPress(goal)}
                                            className="p-4"
                                            style={{ minHeight: 140 }}
                                        >
                                            <View className="flex-row items-center gap-3 mb-6">
                                                <View
                                                    className="w-10 h-10 rounded-full items-center justify-center"
                                                    style={{ backgroundColor: goal.color + '20' }}
                                                >
                                                    <IconSymbol name={goal.icon_sf_symbol as SFSymbols6_0} size={20} color={goal.color} />
                                                </View>
                                                <Text className="text-black text-lg font-bold flex-1" numberOfLines={1}>
                                                    {goal.name}
                                                </Text>
                                                <IconSymbol
                                                    name={expandedGoal[goal.id] ? "chevron.up" : "chevron.down"}
                                                    size={16}
                                                    color="#9ca3af"
                                                />
                                            </View>

                                            <View className="flex flex-col mt-2">
                                                <View className="relative mb-6">
                                                    <View
                                                        style={{
                                                            left: `${Math.max(5, Math.min(95, percent))}%`,
                                                            transform: [{ translateX: -20 }]
                                                        }}
                                                        className="absolute -top-7 items-center"
                                                    >
                                                        <View className="px-2 py-0.5 rounded-md bg-[#1a1a2e]">
                                                            <Text className="text-white text-[10px] font-bold">
                                                                {displayPercent}%
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
                                                                backgroundColor: goal.color
                                                            }}
                                                        />
                                                    </View>
                                                </View>

                                                <View className="flex flex-row items-center justify-between">
                                                    <Text className="text-black/50 text-xs">{formatMonthYear(goal.startDate)}</Text>
                                                    <Text className="text-black/50 text-xs">{formatMonthYear(goal.endDate)}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>

                                        {expandedGoal[goal.id] && (
                                            <View className="px-4 pb-4 pt-0 border-t border-black/5">
                                                {renderGoalHistory(goal)}
                                                <View className="flex-row gap-3 mt-4">
                                                    <TouchableOpacity
                                                        onPress={() => handleEditGoal(goal)}
                                                        className="flex-1 bg-[#ebe9fc] rounded-full py-3 flex-row items-center justify-center gap-2"
                                                    >
                                                        <IconSymbol name="pencil" size={20} color="#6b5aed" />
                                                        <Text className="text-accent text-xl font-semibold">Edit</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => handleOpenUpdate(goal)}
                                                        className="flex-1 bg-accent rounded-full py-3 flex-row items-center justify-center gap-2"
                                                    >
                                                        <IconSymbol name="plus" size={20} color="white" />
                                                        <Text className="text-white text-xl font-semibold">Update</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}


                </ScrollView>
                <TouchableOpacity
                    className="absolute bottom-28 right-4 bg-[#6b5aed] p-6 rounded-full z-10 shadow-md"
                    activeOpacity={0.8}
                    onPress={() => setAddGoalModalVisible(true)}
                    style={{
                        shadowColor: '#6b5aed',
                        shadowOpacity: 0.4,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 6 },
                    }}
                >
                    <IconSymbol name="plus" color="white" weight="bold" size={26} />
                </TouchableOpacity>
            </SafeAreaView>


            <AddGoalModal
                visible={addGoalModalVisible}
                onClose={() => {
                    setAddGoalModalVisible(false);
                    setEditGoal(null);
                }}
                goal={editGoal}
            />
            <DeleteGoalModal
                visible={deleteGoalModalVisible}
                onClose={() => {
                    setDeleteGoalModalVisible(false);
                    setSelectedGoal(null);
                }}
                onDelete={handleDeleteGoal}
                goal={selectedGoal || undefined}
            />
            <UpdateGoalModal
                visible={updateGoalModalVisible}
                onClose={() => {
                    setUpdateGoalModalVisible(false);
                    setSelectedGoal(null);
                }}
                onUpdate={handleUpdateGoal}
                goal={selectedGoal || undefined}
            />
        </LinearGradient>

    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    }
});

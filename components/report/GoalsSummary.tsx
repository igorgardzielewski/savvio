import { ReportGoalsSummary } from "@/types";
import { Image } from "expo-image";
import { SFSymbol } from "expo-symbols";
import React from "react";
import { ScrollView, View } from "react-native";
import CircularProgress from 'react-native-circular-progress-indicator';
import { Text } from "../ui/Text";
import { IconSymbol } from "../ui/icon-symbol";

interface GoalsSummaryProps {
    goalsSummary: ReportGoalsSummary;
}

export default function GoalsSummary({ goalsSummary }: GoalsSummaryProps) {
    return (
        <ScrollView className="w-full mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, gap: 12 }}>
            {goalsSummary.goals.map((goal, index) => {
                const percentage = Math.min(goal.percentageComplete, 100);
                const isCompleted = goal.percentageComplete >= 100;

                return (
                    <View key={index} className="flex flex-row border border-gray-100 rounded-[24px] bg-white shadow-sm shadow-gray-100 overflow-hidden" style={{ minHeight: 120 }}>
                        <View
                            className="relative flex flex-col justify-between p-4 overflow-hidden w-[38%]"
                            style={{
                                backgroundColor: goal.color || '#10b981',
                            }}
                        >
                            <View>
                                <Text className="text-white font-bold text-lg leading-6 pr-1" numberOfLines={2}>
                                    {goal.name}
                                </Text>
                                <Text className="text-white/80 text-xs mt-1 font-medium">
                                    {goal.percentageComplete.toFixed(0)}% done
                                </Text>
                            </View>
                            <View className="absolute -left-3 -bottom-3 opacity-20">
                                <IconSymbol
                                    name={goal.iconUri as SFSymbol}
                                    size={64}
                                    color="white"
                                />
                            </View>
                            <View className="absolute -right-3 -bottom-3">
                                <CircularProgress
                                    value={percentage}
                                    radius={40}
                                    duration={1000}
                                    progressValueColor={'white'}
                                    maxValue={100}
                                    title={''}
                                    titleColor={'white'}
                                    titleStyle={{ fontWeight: 'bold' }}
                                    activeStrokeColor={'white'}
                                    inActiveStrokeColor={'white'}
                                    inActiveStrokeOpacity={0.3}
                                    activeStrokeWidth={6}
                                    inActiveStrokeWidth={6}
                                    showProgressValue={false}
                                />
                                <View className="absolute inset-0 items-center justify-center">
                                    <Text className="text-white font-bold text-sm">{goal.percentageComplete.toFixed(0)}%</Text>
                                </View>
                            </View>
                        </View>

                        <View className="flex-1 p-4 justify-between">
                            <View>
                                <Text className="text-gray-400 text-xs uppercase font-semibold mb-0.5">Saved</Text>
                                <View className="flex flex-row items-end">
                                    <Text className="text-2xl font-bold text-[#1e1b3a]">{goal.currentAmount.toFixed(0)} zł/</Text>
                                    <Text className="text-gray-400 text-sm font-bold ml-1 mb-1">{goal.targetAmount.toFixed(0)} zł</Text>
                                </View>
                            </View>

                            <View className="flex flex-row justify-between items-end">
                                <View>
                                    <Text className="text-gray-400 text-[10px] font-medium uppercase">This Budget</Text>
                                    <Text className="text-gray-600 font-bold text-sm">+{goal.depositThisMonth.toFixed(0)} zł</Text>
                                </View>
                                {isCompleted && (
                                    <View className="px-2 py-1 rounded-lg">
                                        <Text className="text-green-600 text-[10px] font-bold uppercase">Completed</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                );
            })}

            {goalsSummary.aiTip && (
                <View className={'flex flex-row gap-3 w-full items-start mt-2'}>
                    <Image source={require("@/assets/images/aibuddy4.png")} style={{ width: 64, height: 64 }} />
                    <View className={'flex-1 flex flex-row items-center px-4 bg-white rounded-3xl py-4 border border-gray-200'}>
                        <Text className={'flex-shrink text-[#414054] text-sm leading-5'}>{goalsSummary.aiTip}</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

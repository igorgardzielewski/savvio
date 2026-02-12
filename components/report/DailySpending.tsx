import { ReportDailySpending } from "@/types";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text } from "../ui/Text";

const screenWidth = Dimensions.get("window").width;

interface DailySpendingProps {
    dailySpending: ReportDailySpending[];
    startDate: string;
    endDate: string;
    aiTip: string;
}

export default function DailySpending({ dailySpending, startDate, endDate, aiTip }: DailySpendingProps) {
    const chartData = useMemo(() => {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return dailySpending;
            }

            const data = [];
            const spendingMap = new Map(dailySpending.map(item => [item.date, item.amount]));

            const current = new Date(start);
            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                data.push({
                    date: dateStr,
                    amount: spendingMap.get(dateStr) || 0
                });
                current.setDate(current.getDate() + 1);
            }
            return data.length > 0 ? data : dailySpending;
        } catch (e) {
            return dailySpending;
        }
    }, [dailySpending, startDate, endDate]);

    const maxVal = Math.max(...chartData.map(d => d.amount)) || 100;

    const data = chartData.map((d, i) => {
        const parts = d.date.split('-');
        const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d.date;

        return {
            value: d.amount,
            label: label,
            labelTextStyle: { color: 'gray', width: 40, fontSize: 10 },
            hideDataPoint: d.amount === 0 && i !== 0 && i !== chartData.length - 1
        };
    });

    const customDataPoint = () => {
        return (
            <View
                style={{
                    width: 14,
                    height: 14,
                    backgroundColor: 'white',
                    borderWidth: 3,
                    borderRadius: 7,
                    borderColor: '#6b5aed',
                }}
            />
        );
    };

    return (
        <View className="flex-1 items-center justify-center w-full bg-white">
            <View className="items-center justify-center w-full px-2 mt-8">
                {data.length > 0 ? (
                    <LineChart
                        areaChart
                        data={data}
                        width={screenWidth - 64}
                        height={280}
                        spacing={50}
                        initialSpacing={20}
                        color="#6b5aed"
                        thickness={3}
                        startFillColor="rgba(107, 90, 237, 0.3)"
                        endFillColor="rgba(107, 90, 237, 0.01)"
                        startOpacity={0.9}
                        endOpacity={0.1}
                        noOfSections={4}
                        maxValue={maxVal * 1.2}
                        yAxisColor="lightgray"
                        xAxisColor="lightgray"
                        yAxisTextStyle={{ color: 'gray', fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                        customDataPoint={customDataPoint}
                        rulesType="solid"
                        rulesColor="#f0f0f0"
                        yAxisThickness={0}
                        xAxisThickness={0}
                        hideRules={false}
                        pointerConfig={{
                            pointerStripUptoDataPoint: true,
                            pointerStripColor: 'lightgray',
                            pointerStripWidth: 2,
                            strokeDashArray: [2, 5],
                            pointerColor: 'lightgray',
                            radius: 4,
                            pointerLabelWidth: 100,
                            pointerLabelHeight: 120,
                            activatePointersOnLongPress: true,
                            autoAdjustPointerLabelPosition: false,
                            pointerLabelComponent: (items: any) => {
                                const item = items[0];
                                return (
                                    <View
                                        style={{
                                            height: 100,
                                            width: 100,
                                            backgroundColor: 'white',
                                            borderRadius: 4,
                                            borderWidth: 1,
                                            borderColor: '#ebe9fc',
                                            justifyContent: 'center',
                                            paddingLeft: 16,
                                        }}>
                                        <Text style={{ color: 'gray', fontSize: 12 }}>{item.label}</Text>
                                        <Text style={{ color: 'black', fontWeight: 'bold' }}>{item.value} zł</Text>
                                    </View>
                                );
                            },
                        }}
                    />
                ) : (
                    <Text className="text-gray-400">No spending data available</Text>
                )}
            </View>
            {aiTip && (
                <View className={'flex flex-row gap-3 w-full items-start'}>
                    <Image source={require("@/assets/images/aibuddy4.png")} style={{ width: 64, height: 64 }} />
                    <View className={'flex-1 flex flex-row items-center px-4 bg-white rounded-3xl py-4 border border-gray-200'}>
                        <Text className={'flex-shrink text-[#414054] text-sm leading-5'}>{aiTip}</Text>
                    </View>
                </View>
            )}
        </View>
    );
}
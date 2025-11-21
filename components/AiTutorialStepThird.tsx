import {ScrollView,View} from "react-native";
import React from "react";
import { MotiView } from "moti";
import Svg, { Circle, Line } from "react-native-svg";
import {Text} from '@/components/ui/Text'

export default function AiTutorialStepThird() {
    // Circular progress chart data
    const circleSize = 120;
    const strokeWidth = 12;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = 0.75;

    // Bar chart data
    const barData = [
        { height: '60%', label: "Mon" },
        { height: '85%', label: "Tue" },
        { height: '45%', label: "Wed" },
        { height: '95%', label: "Thu" },
    ];

    // Line chart data
    const linePoints = [
        { x: 0, y: 60 },
        { x: 30, y: 40 },
        { x: 60, y: 70 },
        { x: 90, y: 30 },
        { x: 120, y: 50 },
    ];

    return (
        <View className="flex-1 flex flex-col justify-between items-center w-full py-8">
            {/* Charts section */}
            <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-1 items-center justify-center w-full gap-4 px-4">
                <MotiView
                    from={{
                        opacity: 0,
                        translateX: -80,
                        scale: 0.95,
                    }}
                    animate={{
                        opacity: 1,
                        translateX: 0,
                        scale: 1,
                    }}
                    transition={{
                        type: "spring",
                        damping: 100,
                        delay: 200,
                    }}
                    className="bg-white rounded-3xl p-5 w-full"
                    style={{
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 5
                    }}
                >
                    <Text className="text-[#6b5aed] font-bold text-base mb-3">Weekly Spending</Text>
                    <View className="flex-row items-end justify-between h-24 px-2">
                        {barData.map((bar, index) => (
                            <View key={index} className="flex-1 items-center gap-2">
                                <View
                                    className="w-10 rounded-lg bg-[#6b5aed]"
                                    style={{ height: bar.height }}
                                />
                                <Text className="text-gray-600 text-xs font-medium">{bar.label}</Text>
                            </View>
                        ))}
                    </View>
                </MotiView>

                {/* Chart 3: Line Chart */}
                <MotiView
                    from={{
                        opacity: 0,
                        translateX: 80,
                        scale: 0.95,
                    }}
                    animate={{
                        opacity: 1,
                        translateX: 0,
                        scale: 1,
                    }}
                    transition={{
                        type: "spring",
                        damping: 100,
                        delay: 600,
                    }}
                    className="bg-white rounded-3xl p-5 w-full"
                    style={{
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 5
                    }}
                >
                    <Text className="text-[#6b5aed] font-bold text-base mb-3">Savings Trend</Text>
                    <View className="bg-[#f2f0ff] rounded-2xl p-3">
                        <Svg width={260} height={80}>
                            {/* Grid lines */}
                            {[0, 20, 40, 60, 80].map((y) => (
                                <Line
                                    key={y}
                                    x1={0}
                                    y1={y}
                                    x2={260}
                                    y2={y}
                                    stroke="#e5e3fc"
                                    strokeWidth={1}
                                />
                            ))}
                            {/* Line path */}
                            {linePoints.map((point, index) => {
                                if (index === linePoints.length - 1) return null;
                                const nextPoint = linePoints[index + 1];
                                return (
                                    <Line
                                        key={index}
                                        x1={(point.x * 2) + 10}
                                        y1={point.y}
                                        x2={(nextPoint.x * 2) + 10}
                                        y2={nextPoint.y}
                                        stroke="#6b5aed"
                                        strokeWidth={3}
                                        strokeLinecap="round"
                                    />
                                );
                            })}
                            {/* Points */}
                            {linePoints.map((point, index) => (
                                <Circle
                                    key={index}
                                    cx={(point.x * 2) + 10}
                                    cy={point.y}
                                    r={5}
                                    fill="#6b5aed"
                                />
                            ))}
                        </Svg>
                    </View>
                </MotiView>
            </View>
                </ScrollView>

                {/* Text Content - styl jak w Step1 */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                    type: "timing",
                    duration: 600,
                    delay: 400
                }}
                className="w-full"
            >
                <Text className="text-left font-bold text-white text-4xl leading-tight">
                    Get insights{'\n'}and save smarter
                </Text>
                <Text className="text-left font-semibold text-white/80 text-xl mt-4 leading-7">
                    Savvio analyzes your spending and automatically creates simple, visual reports — so you always know where your money goes
                </Text>
            </MotiView>
        </View>
    );
}

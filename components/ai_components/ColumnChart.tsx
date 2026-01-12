import { Text } from "@/components/ui/Text";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, View } from "react-native";

interface ColumnChartProps {
    data: {
        label: string;
        value: number;
    }[];
    title?: string;
    maxBarHeight?: number;
    accentIndex?: number;
    variant?: 'light' | 'dark';
    barWidth?: number;
}

const ColumnChart = ({ data, title, maxBarHeight = 100, accentIndex, variant = 'dark', barWidth = 40 }: ColumnChartProps) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    const isLight = variant === 'light';

    return (
        <View className="w-full">
            {title && (
                <View className="flex-row items-center gap-2 mb-4">
                    <Text className={`font-bold text-base ${isLight ? 'text-[#1a1a2e]' : 'text-white'}`}>
                        {title}
                    </Text>
                </View>
            )}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingVertical: 4, alignItems: 'flex-end' }}
            >
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * maxBarHeight;
                    const isAccent = accentIndex !== undefined ? index === accentIndex : false;

                    return (
                        <View key={index} className="items-center justify-end" style={{ width: barWidth, height: maxBarHeight + 50 }}>
                            <Text className={`text-[10px] font-bold mb-2 ${isLight ? 'text-[#6b5aed]' : 'text-white/90'}`}>
                                {item.value}
                            </Text>
                            <View
                                className="w-full rounded-xl overflow-hidden"
                                style={{ height: Math.max(barHeight, 12) }}
                            >
                                {isLight ? (
                                    <LinearGradient
                                        colors={isAccent ? ['#6b5aed', '#8b7cfb'] : ['#6b5aed99', '#8b7cfb99']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                        style={{ flex: 1, borderRadius: 12 }}
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={isAccent ? ['#ffffff', '#e0e0e0'] : ['#ffffffcc', '#e0e0e0cc']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                        style={{ flex: 1, borderRadius: 12 }}
                                    />
                                )}
                            </View>
                            <Text className={`text-xs font-semibold mt-2 ${isLight ? 'text-[#1a1a2e]/70' : 'text-white/70'}`}>
                                {item.label}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>

            <View className={`mt-4 pt-3`}>
                <Text className={`text-xs ${isLight ? 'text-[#1a1a2e]/60' : 'text-white/60'}`}>
                    Total: <Text className={`font-bold ${isLight ? 'text-[#6b5aed]' : 'text-white'}`}>
                        {data.reduce((sum, d) => sum + d.value, 0)} zł
                    </Text>
                </Text>
            </View>
        </View>
    );
}

export default ColumnChart;

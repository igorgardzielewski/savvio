import { Text } from "@/components/ui/Text";
import { View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface PieChartProps {
    data: {
        label: string;
        value: number;
        color: string;
    }[];
    title?: string;
    size?: number;
    variant?: 'light' | 'dark';
}

const PieChart = ({ data, title, size = 100, variant = 'light' }: PieChartProps) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const isLight = variant === 'light';

    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    let cumulativePercent = 0;

    return (
        <View style={{ width: '100%' }} className="min-w-[100%]">
            {title && (
                <Text className={`font-bold text-base mb-4 ${isLight ? 'text-[#1a1a2e]' : 'text-white'}`}>
                    {title}
                </Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Svg width={size} height={size} style={{ flexShrink: 0 }}>
                    <G rotation="-90" origin={`${center}, ${center}`}>
                        {data.map((item, index) => {
                            const percent = item.value / total;
                            const strokeDashoffset = circumference * cumulativePercent;
                            const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
                            cumulativePercent += percent;

                            return (
                                <Circle
                                    key={index}
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    stroke={item.color}
                                    strokeWidth={16}
                                    fill="transparent"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={-strokeDashoffset}
                                    strokeLinecap="butt"
                                />
                            );
                        })}
                    </G>
                </Svg>

                <View style={{ flex: 1, marginLeft: 16, gap: 8 }}>
                    {data.map((item, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: item.color,
                                    flexShrink: 0
                                }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text className={`text-xs font-medium ${isLight ? 'text-[#1a1a2e]' : 'text-white'}`} numberOfLines={1}>
                                    {item.label}
                                </Text>
                                <Text className={`text-[10px] ${isLight ? 'text-[#1a1a2e]/60' : 'text-white/60'}`}>
                                    {item.value} zł ({((item.value / total) * 100).toFixed(0)}%)
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <View style={{ marginTop: 12, paddingTop: 12 }}>
                <Text className={`text-xs ${isLight ? 'text-[#1a1a2e]/60' : 'text-white/60'}`}>
                    Total: <Text className={`font-bold ${isLight ? 'text-[#6b5aed]' : 'text-white'}`}>
                        {total} zł
                    </Text>
                </Text>
            </View>
        </View>
    );
}

export default PieChart;

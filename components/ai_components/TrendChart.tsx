import { Text } from "@/components/ui/Text";
import { View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";

interface TrendChartProps {
    data: {
        label: string;
        value: number;
    }[];
    title?: string;
    variant?: 'light' | 'dark';
    height?: number;
}

const TrendChart = ({ data, title, variant = 'light', height = 80 }: TrendChartProps) => {
    const isLight = variant === 'light';
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const minValue = Math.min(...data.map(d => d.value));

    const width = (data.length - 1) * 50 + 40;
    const padding = 20;

    const points = data.map((item, index) => {
        const x = padding + index * 50;
        const y = padding + (1 - (item.value - minValue) / (maxValue - minValue || 1)) * (height - padding * 2);
        return { x, y, value: item.value, label: item.label };
    });

    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

    const lastValue = data[data.length - 1]?.value || 0;
    const firstValue = data[0]?.value || 0;
    const trend = lastValue - firstValue;
    const trendPercent = firstValue ? ((trend / firstValue) * 100).toFixed(1) : 0;

    return (
        <View className="w-full">
            {title && (
                <View className="flex-row items-center justify-between mb-4">
                    <Text className={`font-bold text-base ${isLight ? 'text-[#1a1a2e]' : 'text-white'}`}>
                        {title}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${trend >= 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                        <Text className={`text-xs font-bold ${trend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {trend >= 0 ? '+' : ''}{trendPercent}%
                        </Text>
                    </View>
                </View>
            )}

            <Svg width={width} height={height}>
                <Polyline
                    points={polylinePoints}
                    fill="none"
                    stroke={isLight ? '#6b5aed' : '#ffffff'}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {points.map((point, index) => (
                    <Circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={5}
                        fill={isLight ? '#6b5aed' : '#ffffff'}
                    />
                ))}
            </Svg>

            <View className="flex-row justify-between mt-2" style={{ width: width - padding }}>
                {data.map((item, index) => (
                    <View key={index} className="items-center" style={{ width: 50 }}>
                        <Text className={`text-[10px] font-medium ${isLight ? 'text-[#1a1a2e]/70' : 'text-white/70'}`}>
                            {item.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default TrendChart;

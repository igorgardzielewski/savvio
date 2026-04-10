import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/Text";
import { View } from "react-native";
import { SFSymbols6_0 } from "sf-symbols-typescript";

interface ReportCardProps {
    title: string;
    items: {
        label: string;
        value: string;
        icon?: SFSymbols6_0;
        trend?: 'up' | 'down' | 'neutral';
    }[];
    variant?: 'light' | 'dark';
    accentColor?: string;
}

const ReportCard = ({ title, items, variant = 'light', accentColor = '#6b5aed' }: ReportCardProps) => {
    const isLight = variant === 'light';

    return (
        <View className="w-full">
            <View className="flex-row items-center gap-2 mb-4">
                <View
                    className="w-1.5 h-6 rounded-full"
                    style={{ backgroundColor: accentColor }}
                />
                <Text className={`font-bold text-base ${isLight ? 'text-[#1a1a2e]' : 'text-white'}`}>
                    {title}
                </Text>
            </View>

            <View className="gap-4">
                {items.map((item, index) => (
                    <View
                        key={index}
                        className={`flex-row items-center justify-between p-4 rounded-2xl ${isLight ? 'bg-[#f5f4ff]' : 'bg-white/10'}`}
                    >
                        <View className="flex-row items-center gap-3">
                            {item.icon && (
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center"
                                    style={{ backgroundColor: accentColor + '20' }}
                                >
                                    <IconSymbol
                                        name={item.icon}
                                        size={20}
                                        color={accentColor}
                                    />
                                </View>
                            )}
                            <Text className={`font-medium ${isLight ? 'text-[#1a1a2e]' : 'text-white'}`}>
                                {item.label}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Text className={`font-bold ${isLight ? 'text-[#6b5aed]' : 'text-white'}`}>
                                {item.value}
                            </Text>
                            {item.trend && (
                                <IconSymbol
                                    name={item.trend === 'up' ? 'arrow.up.right' : item.trend === 'down' ? 'arrow.down.right' : 'arrow.right'}
                                    size={14}
                                    color={item.trend === 'up' ? '#ef4444' : item.trend === 'down' ? '#22c55e' : '#9ca3af'}
                                />
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default ReportCard;

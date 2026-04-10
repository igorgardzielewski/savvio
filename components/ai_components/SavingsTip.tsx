import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/Text";
import { View } from "react-native";
import { SFSymbols6_0 } from "sf-symbols-typescript";

interface SavingsTipProps {
    title: string;
    description: string;
    savings?: string;
    icon?: SFSymbols6_0;
    variant?: 'light' | 'dark';
}

const SavingsTip = ({
    title,
    description,
    savings,
    icon = 'lightbulb.fill',
    variant = 'light'
}: SavingsTipProps) => {
    const isLight = variant === 'light';

    return (
        <View className="w-full">
            <View
                className="flex-row items-start p-4 rounded-2xl"
                style={{ backgroundColor: isLight ? '#f0fdf4' : 'rgba(34,197,94,0.2)' }}
            >
                <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                    <IconSymbol name={icon} size={20} color="white" />
                </View>

                <View className="flex-1">
                    <Text className={`font-bold text-base ${isLight ? 'text-green-700' : 'text-green-400'}`}>
                        {title}
                    </Text>
                    <Text className={`text-sm mt-1 ${isLight ? 'text-green-600/80' : 'text-green-300/80'}`}>
                        {description}
                    </Text>
                    {savings && (
                        <View className="mt-2 bg-green-500/20 self-start px-3 py-1 rounded-full">
                            <Text className={`text-sm font-bold ${isLight ? 'text-green-600' : 'text-green-400'}`}>
                                💰 Save up to {savings}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

export default SavingsTip;

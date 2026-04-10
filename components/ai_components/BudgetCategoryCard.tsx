import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/Text";
import { BudgetCategory } from "@/types";
import { View } from "react-native";
import { SFSymbols6_0 } from "sf-symbols-typescript";

interface BudgetCategoryCardProps {
    category?: BudgetCategory;
    categories?: BudgetCategory[];
    compact?: boolean;
}

const BudgetCategoryCard = ({ category, categories, compact = false }: BudgetCategoryCardProps) => {
    // If categories array is provided, render list
    if (categories && categories.length > 0) {
        return (
            <View style={{ width: '100%', gap: 12 }}>
                {categories.map((cat) => (
                    <BudgetCategoryItem key={cat.id} category={cat} compact={compact} />
                ))}
            </View>
        );
    }

    // Single category
    if (category) {
        return <BudgetCategoryItem category={category} compact={compact} />;
    }

    return null;
}

const BudgetCategoryItem = ({ category, compact }: { category: BudgetCategory; compact: boolean }) => {
    const percentageSpent = category.allocated > 0
        ? (category.spent / category.allocated * 100)
        : 0;

    const isOverBudget = percentageSpent > 100;

    if (compact) {
        return (
            <View
                className="flex-row items-center p-3 rounded-2xl"
                style={{ backgroundColor: category.color + '15' }}
            >
                <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: category.color }}
                >
                    <IconSymbol
                        name={category.iconUri as SFSymbols6_0}
                        size={20}
                        color="white"
                    />
                </View>
                <View className="flex-1">
                    <Text className="font-semibold text-[#1a1a2e]">{category.name}</Text>
                    <Text className="text-xs text-[#1a1a2e]/60">
                        {category.spent.toFixed(0)} / {category.allocated.toFixed(0)} zł
                    </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Text className={`text-xs font-bold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                        {percentageSpent.toFixed(0)}%
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View
            className="relative flex flex-col justify-between rounded-[24px] p-4 overflow-hidden min-w-[100%]"
            style={{
                backgroundColor: category.color,
                minHeight: 140,
                width: '100%'
            }}
        >
            <View>
                <Text className="text-white font-bold text-xl">
                    {category.name}
                </Text>
                <Text className="text-white/70 text-sm mt-1">
                    {percentageSpent.toFixed(0)}% used
                </Text>
            </View>

            <View className="flex flex-row items-end justify-end">
                <View className="mr-2">
                    <Text className="text-white font-semibold text-sm">
                        {category.spent.toFixed(0)} zł
                    </Text>
                    <Text className="text-white/70 text-xs">
                        of {category.allocated.toFixed(0)} zł
                    </Text>
                </View>
                <View className="w-2 h-16 bg-white rounded-full overflow-hidden border border-white">
                    <View
                        className={`w-full rounded-full ${isOverBudget ? 'bg-red-500/70' : 'bg-white/50'}`}
                        style={{
                            height: `${Math.min(percentageSpent, 100)}%`,
                            alignSelf: 'flex-end',
                            position: 'absolute',
                            bottom: 0,
                        }}
                    />
                </View>
            </View>

            <View className="absolute left-[-16px] bottom-[-8px]">
                <IconSymbol
                    name={category.iconUri as SFSymbols6_0}
                    size={64}
                    color="white"
                    style={{ opacity: 0.4 }}
                />
            </View>
        </View>
    );
}

export default BudgetCategoryCard;

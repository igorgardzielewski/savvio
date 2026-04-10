import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CircularProgressBase } from 'react-native-circular-progress-indicator';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { BudgetCategory } from '@/types';
import {SFSymbols6_0} from "sf-symbols-typescript";

export default function CategoryPill({ category, selectedCategory, onPress }: { category: BudgetCategory; selectedCategory: BudgetCategory | null; onPress: () => void }) {
    const percentageSpent = category.allocated > 0 ? Math.min(100, (category.spent / category.allocated) * 100) : 0;
    return (
        <TouchableOpacity
            key={category.id}
            className={' rounded-full items-center p-2 justify-center '}
            style={{ backgroundColor: selectedCategory?.id === category.id ? category.color : 'white' }}
            onPress={onPress}
        >
            <CircularProgressBase
                value={percentageSpent}
                radius={28}
                activeStrokeWidth={4}
                inActiveStrokeWidth={4}
                maxValue={100}
                activeStrokeColor={selectedCategory?.id === category.id ? 'white' : category.color}
                circleBackgroundColor={selectedCategory?.id === category.id ? category.color : 'white'}
                inActiveStrokeColor={selectedCategory?.id === category.id ? '#ffffff90' : category.color + '30'}
                strokeLinecap="butt"
                rotation={0}
                clockwise={false}
            >
                <View style={{ alignItems: 'center' }}>
                    <IconSymbol name={category.iconUri as SFSymbols6_0} color={selectedCategory?.id === category.id ? 'white' : category.color} weight="bold" size={24} />
                </View>
            </CircularProgressBase>
        </TouchableOpacity>
    );
}


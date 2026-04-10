import React, { memo, useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text } from '@/components/ui/Text';

type LocalReceiptItemData = {
    id: number;
    name: string;
    quantity: string;
    unit: string;
    amount: string;
}

// eslint-disable-next-line react/display-name
export default memo(({
    item,
    onUpdate,
    onDelete
}: {
    item: LocalReceiptItemData;
    onUpdate: (id: number, field: keyof LocalReceiptItemData, value: string) => void;
    onDelete: (id: number) => void;
}) => {
    const [showUnitPicker, setShowUnitPicker] = useState(false);
    const formatAmount = (text: string) => {
        let normalized = text.replace(/,/g, '.');
        normalized = normalized.replace(/[^0-9.]/g, '');
        const firstDotIndex = normalized.indexOf('.');
        if (firstDotIndex !== -1) {
            const integer = normalized.slice(0, firstDotIndex);
            let fraction = normalized.slice(firstDotIndex + 1).replace(/\./g, '');
            if (fraction.length > 2) {
                fraction = fraction.slice(0, 2);
            }
            normalized = integer + '.' + fraction;
        }
        return normalized;
    };

    const normalizeQuantity = (text: string) => {
        let t = text.replace(/,/g, '.');
        t = t.replace(/[^0-9.]/g, '');
        const parts = t.split('.');
        if (parts.length > 1) {
            const integer = parts[0];
            let fraction = parts.slice(1).join('');
            if (fraction.length > 3) fraction = fraction.slice(0, 3);
            t = integer + '.' + fraction;
        }
        return t;
    };

    return (
        <View className="flex-col">
            <View className="flex-row justify-between items-center py-2">
                <TextInput
                    className="text-base text-black font-medium flex-1"
                    placeholder="Item name"
                    onChangeText={(text) => onUpdate(item.id, 'name', text)}
                    value={item.name}
                    style={{
                        fontFamily: 'Inter',
                        padding: 0,
                        margin: 0,
                        lineHeight: 18,
                        fontSize: 16,
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                    }}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                    keyboardType="default"
                    underlineColorAndroid="transparent"
                />

                {/* quantity + unit container */}
                <View className="flex-row items-center w-[28%] justify-center gap-2">
                    <TextInput
                        className="text-base text-black font-medium"
                        placeholder="0"
                        onChangeText={(text) => {
                            const normalized = normalizeQuantity(text);
                            onUpdate(item.id, 'quantity', normalized);
                        }}
                        value={item.quantity}
                        style={{
                            fontFamily: 'Inter',
                            padding: 0,
                            margin: 0,
                            lineHeight: 18,
                            fontSize: 16,
                            includeFontPadding: false,
                            textAlignVertical: 'center',
                            width: 56,
                            textAlign: 'right',
                        }}
                        autoCapitalize="none"
                        maxLength={7}
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                        underlineColorAndroid="transparent"
                    />
                    <TouchableOpacity
                        onPress={() => setShowUnitPicker(!showUnitPicker)}
                        className="px-2 py-0.5 bg-gray-100 rounded-md"
                        style={{ minWidth: 32, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text className="text-xs text-gray-600 font-medium">{item.unit}</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    className="text-base text-black font-medium w-[20%] text-right"
                    placeholder="0.00"
                    onChangeText={(text) => {
                        const formatted = formatAmount(text);
                        onUpdate(item.id, 'amount', formatted);
                    }}
                    value={item.amount}
                    style={{
                        fontFamily: 'Inter',
                        padding: 0,
                        margin: 0,
                        lineHeight: 18,
                        fontSize: 16,
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                    }}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                    underlineColorAndroid="transparent"
                />
                <TouchableOpacity onPress={() => onDelete(item.id)} className="ml-2">
                    <IconSymbol name="bin.xmark" size={20} weight="bold" color="#e37a9e" />
                </TouchableOpacity>
            </View>
            {showUnitPicker && (
                <View className="flex-row gap-2 mt-2 mb-1 pl-2">
                    {['pcs', 'kg', 'g', 'l', 'ml'].map((unit) => (
                        <TouchableOpacity
                            key={unit}
                            onPress={() => {
                                onUpdate(item.id, 'unit', unit);
                                setShowUnitPicker(false);
                            }}
                            className={`px-3 py-1.5 rounded-full ${item.unit === unit ? 'bg-accent' : 'bg-gray-100'}`}
                        >
                            <Text className={`text-sm font-medium ${item.unit === unit ? 'text-white' : 'text-heading'}`}>
                                {unit}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
});


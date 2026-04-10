import { Text } from "@/components/ui/Text";
import { getLogoSource } from "@/helpers/imageHelpers";
import { Transaction } from "@/types";
import { Image, View } from "react-native";

interface PaymentSummaryProps {
    transaction?: Transaction;
    transactions?: Transaction[];
    variant?: 'light' | 'dark';
}

const PaymentSummary = ({ transaction, transactions, variant = 'light' }: PaymentSummaryProps) => {
    if (transactions && transactions.length > 0) {
        return (
            <View style={{ width: '100%', gap: 12 }}>
                {transactions.map((t) => (
                    <PaymentSummaryItem key={t.id} transaction={t} variant={variant} />
                ))}
            </View>
        );
    }

    if (transaction) {
        return <PaymentSummaryItem transaction={transaction} variant={variant} />;
    }

    return null;
}

const PaymentSummaryItem = ({ transaction, variant }: { transaction: Transaction; variant: 'light' | 'dark' }) => {
    const isLight = variant === 'light';

    return (
        <View style={{ width: '100%' }}>
            <View
                className="flex-row items-center p-4 rounded-2xl"
                style={{ backgroundColor: isLight ? '#f5f4ff' : 'rgba(255,255,255,0.1)' }}
            >
                <View className="w-14 h-14 rounded-2xl overflow-hidden bg-white items-center justify-center mr-4">
                    <Image
                        source={getLogoSource(transaction.shop.logoUrl)}
                        className="w-14 h-14"
                        resizeMode="cover"
                    />
                </View>

                <View className="flex-1">
                    <Text className={`font-bold text-lg ${isLight ? 'text-[#1a1a2e]' : 'text-white'}`}>
                        {transaction.shop.name}
                    </Text>
                    <Text className={`text-sm ${isLight ? 'text-[#1a1a2e]/60' : 'text-white/60'}`}>
                        {transaction.shop.categoryName}
                    </Text>
                </View>

                <View className="items-end">
                    <Text className="font-bold text-lg text-[#f87171]">
                        -{transaction.amount.toFixed(2)} zł
                    </Text>
                    <Text className={`text-xs ${isLight ? 'text-[#1a1a2e]/50' : 'text-white/50'}`}>
                        {transaction.date instanceof Date ? transaction.date.toLocaleDateString() : transaction.date}
                    </Text>
                </View>
            </View>

            {transaction.receiptPositions && transaction.receiptPositions.length > 0 && (
                <View className="mt-3 gap-2">
                    {transaction.receiptPositions.slice(0, 3).map((item, index) => (
                        <View key={item.id || index} className="flex-row justify-between">
                            <Text className={`text-sm ${isLight ? 'text-[#1a1a2e]/70' : 'text-white/70'}`}>
                                {item.quantity}x {item.name}
                            </Text>
                            <Text className={`text-sm font-medium ${isLight ? 'text-[#1a1a2e]' : 'text-white'}`}>
                                {item.totalItemPrice.toFixed(2)} zł
                            </Text>
                        </View>
                    ))}
                    {transaction.receiptPositions.length > 3 && (
                        <Text className={`text-xs ${isLight ? 'text-[#6b5aed]' : 'text-white/60'}`}>
                            +{transaction.receiptPositions.length - 3} more items
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

export default PaymentSummary;

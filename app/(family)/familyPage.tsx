import FamilySettingsModal from "@/components/FamilySettingsModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/Text";
import { getLogoSource } from "@/helpers/imageHelpers";
import { getShopIcon } from "@/helpers/shopCategoryHelpers";
import { getInitials } from "@/helpers/stringHelpers";
import { formatDateLong, formatTime } from "@/helpers/timeHelper";
import { useUserStore } from "@/store/userStore";
import { FamilyMember, Transaction } from "@/types";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SFSymbols6_0 } from "sf-symbols-typescript";
import { familyUsersColors } from "../(tabs)/index";

type FamilyTransaction = Transaction & {
    memberId: number;
    memberIndex: number;
};

export default function FamilyPage() {
    const router = useRouter();
    const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const { user } = useUserStore();
    const members: FamilyMember[] = user?.family?.members ?? [];

    const allTransactions: FamilyTransaction[] = useMemo(() => {
        const transactions: FamilyTransaction[] = [];
        members.forEach((member) => {
            if (member.shareLevel === 'ALL' && member.transactions) {
                member.transactions.forEach(t => {
                    transactions.push({
                        ...t,
                        memberId: member.userId,
                        memberIndex: members.indexOf(member),
                    });
                });
            }
        });
        return transactions.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
            const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
            return dateB - dateA;
        });
    }, [members]);

    const selectedMember = selectedMemberIndex !== null ? members[selectedMemberIndex] : null;
    const showTransactions = selectedMemberIndex === null || selectedMember?.shareLevel === 'ALL';

    const filteredTransactions = useMemo(() => {
        if (!showTransactions) return [];

        let filtered = allTransactions;

        if (selectedMemberIndex !== null) {
            filtered = filtered.filter(t => t.memberId === members[selectedMemberIndex]?.userId);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.shop?.name?.toLowerCase().includes(query) ||
                t.shop?.categoryName?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [selectedMemberIndex, searchQuery, allTransactions, showTransactions, members]);

    const groupedTransactions = useMemo(() => {
        const groups: { [date: string]: FamilyTransaction[] } = {};
        filteredTransactions.forEach(t => {
            const dateKey = t.date instanceof Date ? t.date.toISOString().split('T')[0] : String(t.date);
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(t);
        });
        return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
    }, [filteredTransactions]);

    const getMemberForTransaction = (t: FamilyTransaction) => {
        const member = members.find(m => m.userId === t.memberId);
        return member ?? members[0];
    };
    const currentUserMember = user?.family?.members.find(m => m.userId === user?.id);
    const isOwner = currentUserMember?.owner ?? false;
    return (
        <SafeAreaView className="flex-1 bg-[#f2f0ff]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="px-2 pt-4 gap-4">
                        <View className="flex-row items-center gap-4 px-2 justify-between">
                            <View className="flex-row items-center gap-2">
                                <TouchableOpacity onPress={() => router.back()} className="rounded-full p-4 bg-white">
                                    <IconSymbol name={'arrow.left'} size={24} color={'#6b5aed'} />
                                </TouchableOpacity>
                                <Text className="text-[#120f29] text-3xl font-semibold">Family</Text>
                            </View>
                        </View>

                        <View className="flex-col gap-3 bg-white px-4 py-6 rounded-[32px] border border-[#e2deff]">
                            {members.map((member, index) => {
                                const MAX_BAR_WIDTH = 180;
                                const MIN_BAR_WIDTH = 20;
                                const barWidth = MIN_BAR_WIDTH + (member.budgetPercentage / 100) * (MAX_BAR_WIDTH - MIN_BAR_WIDTH);
                                const isSelected = selectedMemberIndex === index;

                                return (
                                    <TouchableOpacity
                                        key={member.userId}
                                        className="flex-row items-center"
                                        activeOpacity={0.7}
                                        onPress={() => setSelectedMemberIndex(isSelected ? null : index)}
                                        style={{ opacity: selectedMemberIndex !== null && !isSelected ? 0.4 : 1 }}
                                    >
                                        <View
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 24,
                                                borderColor: familyUsersColors[index % familyUsersColors.length].border,
                                                borderWidth: isSelected ? 3 : 2,
                                                backgroundColor: familyUsersColors[index % familyUsersColors.length].background,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 1,
                                            }}
                                        >
                                            <Text className="font-bold text-xl" style={{
                                                color: familyUsersColors[index % familyUsersColors.length].border,
                                            }}>
                                                {getInitials(member.firstName, member.lastName)}
                                            </Text>
                                        </View>
                                        <View
                                            style={{
                                                marginLeft: -24,
                                                paddingLeft: 32,
                                                backgroundColor: familyUsersColors[index % familyUsersColors.length].background,
                                                width: barWidth,
                                                height: 40,
                                                borderTopRightRadius: 20,
                                                borderBottomRightRadius: 20,
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Text className="font-semibold text-sm" style={{
                                                color: familyUsersColors[index % familyUsersColors.length].border,
                                            }}>
                                                {(member.budgetPercentage ?? 0).toFixed(0)}%
                                            </Text>
                                        </View>
                                        {isSelected && (member.shareLevel === 'SUMMARY' || member.shareLevel === 'ALL') && member.spent !== undefined && member.budgetLimit !== undefined && (
                                            <View className="ml-3">
                                                <Text className="text-xs text-black/60">
                                                    {(member.spent ?? 0).toFixed(0)} / <Text style={{ fontWeight: 'bold' }}>{(member.budgetLimit ?? 0).toFixed(0)} zł</Text>
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                            <Text className="text-[10px] text-black/60 text-center">Tap on a member to see their data</Text>
                        </View>

                        <View className="px-2 gap-4">
                            {selectedMember && selectedMember.shareLevel !== 'ALL' ? (
                                <View className="bg-white rounded-[24px] border border-[#e2deff] p-8 items-center gap-3">
                                    <View
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 28,
                                            borderColor: familyUsersColors[selectedMemberIndex! % familyUsersColors.length].border,
                                            borderWidth: 2,
                                            backgroundColor: familyUsersColors[selectedMemberIndex! % familyUsersColors.length].background,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text className="font-bold text-2xl" style={{
                                            color: familyUsersColors[selectedMemberIndex! % familyUsersColors.length].border,
                                        }}>
                                            {getInitials(selectedMember.firstName, selectedMember.lastName)}
                                        </Text>
                                    </View>
                                    <Text className="font-semibold text-lg text-black">{selectedMember.firstName} {selectedMember.lastName}</Text>
                                    <IconSymbol name="lock.fill" size={24} color="#9ca3af" />
                                    <Text className="text-black/50 text-center text-sm">
                                        This user doesn't share their transactions
                                    </Text>
                                    <TouchableOpacity
                                        className="rounded-full bg-black/5 p-4 mt-2"
                                        onPress={() => setSelectedMemberIndex(null)}
                                    >
                                        <IconSymbol name="xmark" size={24} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 gap-3 border border-[#e2deff]">
                                        <IconSymbol name="magnifyingglass" size={20} color="#9ca3af" />
                                        <TextInput
                                            className="flex-1 text-black"
                                            placeholder="Search transactions..."
                                            placeholderTextColor="#9ca3af"
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                            style={{ paddingVertical: 4 }}
                                        />
                                        {searchQuery.length > 0 && (
                                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                                <IconSymbol name="xmark.circle.fill" size={18} color="#9ca3af" />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <View className="gap-4">
                                        {groupedTransactions.length === 0 ? (
                                            <View className="bg-white rounded-[24px] border border-[#e2deff] p-6">
                                                <Text className="text-center text-black/50">No transactions found</Text>
                                            </View>
                                        ) : (
                                            groupedTransactions.map(([date, transactions]) => (
                                                <View key={date} className="w-full">
                                                    <View className="flex-row items-end justify-between mb-2 px-2">
                                                        <Text className="font-bold text-sm text-black/70">{formatDateLong(date)}</Text>
                                                    </View>
                                                    <View className="bg-white rounded-[24px] border border-[#e2deff] p-4 gap-3">
                                                        {transactions.map((transaction, itemIndex) => {
                                                            const member = getMemberForTransaction(transaction);
                                                            const memberColor = familyUsersColors[transaction.memberIndex % familyUsersColors.length];

                                                            return (
                                                                <React.Fragment key={transaction.id}>
                                                                    {itemIndex > 0 && <View className="h-[1px] bg-black/5 w-full" />}
                                                                    <View className="flex-row items-center gap-3">
                                                                        <View
                                                                            style={{
                                                                                width: 36,
                                                                                height: 36,
                                                                                borderRadius: 18,
                                                                                borderColor: memberColor.border,
                                                                                borderWidth: 2,
                                                                                backgroundColor: memberColor.background,
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                            }}
                                                                        >
                                                                            <Text className="font-bold text-sm" style={{ color: memberColor.border }}>
                                                                                {getInitials(member.firstName, member.lastName)}
                                                                            </Text>
                                                                        </View>

                                                                        <View className="relative">
                                                                            <Image
                                                                                source={getLogoSource(transaction.shop.logoUrl)}
                                                                                className="w-12 h-12 rounded-[12px]"
                                                                            />
                                                                            <View
                                                                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                                                                                style={{ backgroundColor: transaction.shop.categoryColor }}
                                                                            >
                                                                                <IconSymbol
                                                                                    name={getShopIcon(transaction.shop.categoryName) as SFSymbols6_0}
                                                                                    size={10}
                                                                                    color="white"
                                                                                />
                                                                            </View>
                                                                        </View>

                                                                        <View className="flex-1">
                                                                            <Text className="font-bold text-sm">{transaction.shop.name}</Text>
                                                                            <View className="flex-row items-center gap-1">
                                                                                <Text className="text-xs text-black/50">{formatTime(transaction.time)}</Text>
                                                                                <View className="w-1 h-1 rounded-full bg-black/30" />
                                                                                <Text className="text-xs text-black/50">{transaction.shop.categoryName}</Text>
                                                                            </View>
                                                                        </View>

                                                                        <Text className="text-sm font-bold text-[#f87171]">
                                                                            -{Math.abs(transaction.amount).toFixed(2) || 0} zł
                                                                        </Text>
                                                                    </View>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </View>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </ScrollView>
                <TouchableOpacity className="rounded-full p-4 bg-accent absolute bottom-4 right-4" activeOpacity={0.7} onPress={() => setShowSettings(true)}>
                    <IconSymbol name={'gear'} size={28} color={'white'} />
                </TouchableOpacity>
            </KeyboardAvoidingView>
            <FamilySettingsModal visible={showSettings} onClose={() => { setShowSettings(false) }} userType={isOwner ? 'owner' : 'member'} members={user?.family?.members ?? []} />
        </SafeAreaView>
    );
}
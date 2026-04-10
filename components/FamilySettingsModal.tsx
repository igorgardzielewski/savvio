import { familyUsersColors } from "@/app/(tabs)";
import { Text } from "@/components/ui/Text";
import { getInitials } from "@/helpers/stringHelpers";
import { formatDate, formatTime } from "@/helpers/timeHelper";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { FamilyMember } from "@/types";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "./ui/icon-symbol";

interface FamilySettingsModalProps {
    visible: boolean;
    onClose: () => void;
    userType: 'owner' | 'member';
    members: FamilyMember[];
}

export default function FamilySettingsModal({ visible, onClose, userType, members }: FamilySettingsModalProps) {
    const router = useRouter();
    const { token } = useAuthStore();
    const { user, updateFamily } = useUserStore();

    const [step, setStep] = React.useState<'settings' | 'code' | 'members' | 'shareLevel' | 'delete' | 'leave'>('settings');
    const [code, setCode] = React.useState('');
    const [codeLoading, setCodeLoading] = React.useState(false);
    const [selectedMembers, setSelectedMembers] = React.useState<number[]>([]);
    const [shareLevel, setShareLevel] = React.useState<'NONE' | 'SUMMARY' | 'ALL'>('NONE');
    const [codeExpiresAt, setCodeExpiresAt] = React.useState<Date | null>(null);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const currentMember = members.find(m => m.userId === user?.id);
        if (currentMember?.shareLevel) {
            setShareLevel(currentMember.shareLevel);
        }
    }, [members, user?.id]);
    const handleGenerateCode = async () => {
        setStep('code');
        setCodeLoading(true);
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/family/generate-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setCode(data.inviteCode);
                setCodeExpiresAt(data.expiresAt);
            }
        }
        catch (e) {
            console.log(e);
        }
        finally {
            setCodeLoading(false);
        }
    };

    const handleManageMembers = () => {
        setSelectedMembers([]);
        setStep('members');
    };

    const toggleMemberSelection = (memberId: number) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const [removeMembersLoading, setRemoveMembersLoading] = React.useState(false);
    const [removeMembersError, setRemoveMembersError] = React.useState<string | null>(null);

    const handleDeleteMembers = async () => {
        if (selectedMembers.length === 0) return;
        setRemoveMembersLoading(true);
        setRemoveMembersError(null);
        try {
            for (const memberId of selectedMembers) {
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/family/members/${memberId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    setRemoveMembersError('Failed to remove some members. Try again.');
                    break;
                }
            }
            const familyRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/family`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (familyRes.ok) {
                const data = await familyRes.json();
                updateFamily(data);
            }
            setSelectedMembers([]);
            setStep('settings');
        } catch (e) {
            console.log(e);
            setRemoveMembersError('Failed to remove members. Try again.');
        } finally {
            setRemoveMembersLoading(false);
        }
    };

    const handleShareLevel = () => {
        setStep('shareLevel');
    };

    const [shareLevelLoading, setShareLevelLoading] = React.useState(false);
    const [shareLevelError, setShareLevelError] = React.useState<string | null>(null);

    const handleSaveShareLevel = async () => {
        setShareLevelLoading(true);
        setShareLevelError(null);
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/family/share-level`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ shareLevel }),
            });
            if (res.ok) {
                const familyRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/family`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (familyRes.ok) {
                    const data = await familyRes.json();
                    updateFamily(data);
                }
                setStep('settings');
            } else {
                setShareLevelError('Failed to update share level. Try again.');
            }
        } catch (e) {
            console.log(e);
            setShareLevelError('Failed to update share level. Try again.');
        } finally {
            setShareLevelLoading(false);
        }
    };
    const handleDeleteFamily = () => {
        setStep('delete');
    };
    const handleDeleteFamilyConfirm = async () => {
        setDeleteLoading(true);
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/family`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                updateFamily(null);
                onClose();
                router.push('/(tabs)')
            }
            else {
                setDeleteError('Failed to delete family. Try again.');
            }
        }
        catch (e) {
            console.log(e);
        }
        finally {
            setDeleteLoading(false);
        }
    };
    const handleLeaveFamily = () => {
        setStep('leave');
    };
    const [leaveLoading, setLeaveLoading] = React.useState(false);
    const [leaveError, setLeaveError] = React.useState<string | null>(null);
    const handleLeaveFamilyConfirm = async () => {
        setLeaveLoading(true);
        setLeaveError(null);
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/family/members/${user?.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                updateFamily(null);
                onClose();
                router.push('/(tabs)');
            } else {
                setLeaveError('Failed to leave family. Try again.');
            }
        } catch (e) {
            console.log(e);
            setLeaveError('Failed to leave family. Try again.');
        } finally {
            setLeaveLoading(false);
        }
    };
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                activeOpacity={1}
                onPress={onClose}
            >
                <SafeAreaView edges={['bottom']}>
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={{ margin: 8, backgroundColor: 'white', borderRadius: 40, paddingBottom: 24, paddingTop: 2, paddingHorizontal: 24 }}>
                            <View style={{ minHeight: 200 }} className="justify-between">
                                <View style={{ paddingTop: 24 }}>
                                    <Text className="text-xl font-semibold text-black mb-2">
                                        {step === 'members' ? 'Manage Members' : 'Settings'}
                                    </Text>
                                </View>
                                <View className="px-6 gap-4 py-8">
                                    {step === 'settings' && (
                                        <>
                                            {userType === 'owner' && (
                                                <TouchableOpacity className="items-center justify-between flex-row" onPress={handleGenerateCode}>
                                                    <Text className="text-lg font-medium text-black">Generate new code</Text>
                                                    <IconSymbol name={'chevron.right'} size={14} color={'black'} />
                                                </TouchableOpacity>
                                            )}
                                            {userType === 'owner' && (
                                                <TouchableOpacity className="items-center justify-between flex-row" onPress={handleManageMembers}>
                                                    <Text className="text-lg font-medium text-black">Manage members</Text>
                                                    <IconSymbol name={'chevron.right'} size={14} color={'black'} />
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity className="items-center justify-between flex-row" onPress={handleShareLevel}>
                                                <Text className="text-lg font-medium text-black">Change share level</Text>
                                                <IconSymbol name={'chevron.right'} size={14} color={'black'} />
                                            </TouchableOpacity>
                                            <TouchableOpacity className="items-center justify-between flex-row" onPress={userType === 'owner' ? handleDeleteFamily : handleLeaveFamily}>
                                                <Text className="text-lg font-medium text-black">{userType === 'owner' ? 'Delete family' : 'Leave family'}</Text>
                                                <IconSymbol name={'chevron.right'} size={14} color={'black'} />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                    {step === 'code' && (
                                        codeLoading ? (
                                            <View className="flex items-center justify-center">
                                                <ActivityIndicator size="large" color="#6B5AED" />
                                            </View>
                                        ) : (
                                            <View className="flex flex-col items-center justify-center gap-4">
                                                <View className="flex flex-row items-center justify-center">
                                                    {Array.from({ length: 6 }).map((_, index) => (
                                                        <View key={index} className="w-12 h-12 bg-gray-200 rounded-xl mr-2 flex items-center justify-center">
                                                            <Text className="text-center text-xl font-semibold">{code[index]}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                                <Text className="text-center text-sm font-semibold">Expires at: {formatDate(codeExpiresAt?.toString().split('T')[0])} {formatTime(codeExpiresAt?.toString().split('T')[1])}</Text>
                                            </View>
                                        )
                                    )}
                                    {step === 'members' && (
                                        <View className="flex flex-col gap-4">
                                            <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                                                <View className="gap-3">
                                                    {members.filter(m => m.userId !== user?.id).map((member, index) => {
                                                        const isSelected = selectedMembers.includes(member.userId);
                                                        return (
                                                            <TouchableOpacity
                                                                key={member.userId}
                                                                className={`flex flex-row items-center justify-between p-2 rounded-full ${isSelected ? 'border-2 border-black' : 'border border-gray-200'}`}
                                                                activeOpacity={0.8}
                                                                onPress={() => toggleMemberSelection(member.userId)}
                                                            >
                                                                <View className="flex-row items-center gap-2">
                                                                    <View
                                                                        style={{
                                                                            width: 40,
                                                                            height: 40,
                                                                            borderRadius: 20,
                                                                            borderColor: familyUsersColors[index % familyUsersColors.length].border,
                                                                            borderWidth: 2,
                                                                            backgroundColor: familyUsersColors[index % familyUsersColors.length].background,
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                        }}
                                                                    >
                                                                        <Text className="font-bold text-lg" style={{
                                                                            color: familyUsersColors[index % familyUsersColors.length].border,
                                                                        }}>
                                                                            {getInitials(member.firstName, member.lastName)}
                                                                        </Text>
                                                                    </View>
                                                                    <Text className="text-gray-500 font-medium">{member.firstName} {member.lastName}</Text>
                                                                </View>
                                                                <View
                                                                    className={`w-6 h-6 rounded-md mr-2 items-center justify-center ${isSelected ? 'bg-accent' : 'border-2 border-gray-300'}`}
                                                                >
                                                                    {isSelected && (
                                                                        <IconSymbol name="checkmark" size={14} color="white" />
                                                                    )}
                                                                </View>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            </ScrollView>
                                            {removeMembersLoading && (
                                                <ActivityIndicator size="large" color="#6B5AED" />
                                            )}
                                            {removeMembersError && (
                                                <Text className="text-center text-sm text-red-400">{removeMembersError}</Text>
                                            )}
                                        </View>
                                    )}
                                    {step === 'shareLevel' && (
                                        <View className="flex-col items-center w-full gap-3">
                                            <View className="flex-row items-center gap-2">
                                                <TouchableOpacity
                                                    className={`rounded-full p-4 ${shareLevel === 'NONE' ? 'bg-accent' : 'bg-gray-300'}`}
                                                    onPress={() => setShareLevel('NONE')}
                                                >
                                                    <Text className={`text-lg font-semibold ${shareLevel === 'NONE' ? 'text-white' : 'text-gray-600'}`}>None</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    className={`rounded-full p-4 ${shareLevel === 'SUMMARY' ? 'bg-accent' : 'bg-gray-300'}`}
                                                    onPress={() => setShareLevel('SUMMARY')}
                                                >
                                                    <Text className={`text-lg font-semibold ${shareLevel === 'SUMMARY' ? 'text-white' : 'text-gray-600'}`}>Summary</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    className={`rounded-full p-4 ${shareLevel === 'ALL' ? 'bg-accent' : 'bg-gray-300'}`}
                                                    onPress={() => setShareLevel('ALL')}
                                                >
                                                    <Text className={`text-lg font-semibold ${shareLevel === 'ALL' ? 'text-white' : 'text-gray-600'}`}>All</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <Text className="text-center text-sm text-black/60 px-2">
                                                {shareLevel === 'NONE'
                                                    ? <>Users will see only your <Text className="font-bold">budget progress %</Text></>
                                                    : shareLevel === 'SUMMARY'
                                                        ? <>Users will see your <Text className="font-bold">budget progress %</Text> and <Text className="font-bold">total balance</Text></>
                                                        : <>Users will see your <Text className="font-bold">budget progress %</Text>, <Text className="font-bold">balance</Text> and <Text className="font-bold">all transactions</Text></>
                                                }
                                            </Text>
                                            {shareLevelLoading && <ActivityIndicator size="large" color="#6B5AED" />}
                                            {shareLevelError && <Text className="text-center text-sm text-red-400 px-2">{shareLevelError}</Text>}
                                        </View>
                                    )}
                                    {step === 'delete' && (
                                        <View className="flex-col items-center w-full gap-3">
                                            {deleteLoading ? <ActivityIndicator size="large" color="#6B5AED" /> :
                                                <>
                                                    <Text className="text-center font-bold text-lg text-black/60 px-2">
                                                        Are you sure you want to delete this family?
                                                    </Text>
                                                    {deleteError && <Text className="text-center text-sm text-red-400 px-2">{deleteError}</Text>}
                                                </>}
                                        </View>
                                    )}
                                    {step === 'leave' && (
                                        <View className="flex-col items-center w-full gap-3">
                                            {leaveLoading ? <ActivityIndicator size="large" color="#6B5AED" /> :
                                                <>
                                                    <Text className="text-center font-bold text-lg text-black/60 px-2">
                                                        Are you sure you want to leave this family?
                                                    </Text>
                                                    {leaveError && <Text className="text-center text-sm text-red-400 px-2">{leaveError}</Text>}
                                                </>}
                                        </View>
                                    )}
                                </View>
                                <View style={{ gap: 12 }}>
                                    {step === 'delete' && (
                                        <TouchableOpacity
                                            className="bg-red-400 rounded-full py-[14px] align-middle"
                                            onPress={handleDeleteFamilyConfirm}
                                        >
                                            <Text className="font-bold text-lg text-white text-center">
                                                Delete
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    {step === 'leave' && (
                                        <TouchableOpacity
                                            className="bg-red-400 rounded-full py-[14px] align-middle"
                                            onPress={handleLeaveFamilyConfirm}
                                        >
                                            <Text className="font-bold text-lg text-white text-center">
                                                Leave
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    {selectedMembers.length > 0 && step === 'members' && (
                                        <TouchableOpacity
                                            className="bg-red-400 rounded-full py-[14px] align-middle"
                                            onPress={handleDeleteMembers}
                                        >
                                            <Text className="font-bold text-lg text-white text-center">
                                                Remove
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    {step === 'shareLevel' && (
                                        <TouchableOpacity
                                            onPress={handleSaveShareLevel}
                                            className="bg-accent rounded-full py-[14px] align-middle"
                                            disabled={shareLevelLoading}
                                        >
                                            <Text className="font-bold text-lg text-white text-center">Save</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (step !== 'settings') {
                                                if (step === 'shareLevel') {
                                                    const currentMember = members.find(m => m.userId === user?.id);
                                                    if (currentMember?.shareLevel) {
                                                        setShareLevel(currentMember.shareLevel);
                                                    }
                                                }
                                                setStep('settings');
                                                setSelectedMembers([]);
                                            } else {
                                                onClose();
                                            }
                                        }}
                                        className="bg-[#ebe9fc] rounded-full py-[14px] align-middle"
                                    >
                                        <Text className="font-bold text-lg text-accent text-center">{step !== 'settings' ? 'Back' : 'Close'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </SafeAreaView>
            </TouchableOpacity>
        </Modal>
    );
}
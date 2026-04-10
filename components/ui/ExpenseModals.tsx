// app/components/ui/ExpenseModals.tsx
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    TextInput,
    Image,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/ui/Text';
import { IconSymbol } from '@/components/ui/icon-symbol';

type ExpenseData = {
    title: string;
    amount: number;
    category?: string;
    date?: string;
    receiptUri?: string | null;
};

type AddExpenseModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (expense: ExpenseData) => void;
    defaultCategory?: string;
};

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
                                                                    visible,
                                                                    onClose,
                                                                    onSave,
                                                                    defaultCategory,
                                                                }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(defaultCategory || '');
    const [date, setDate] = useState(new Date().toISOString());
    const [receiptUri, setReceiptUri] = useState<string | null>(null);
    const [scanModalVisible, setScanModalVisible] = useState(false);

    useEffect(() => {
        if (!visible) {
            setTitle('');
            setAmount('');
            setCategory(defaultCategory || '');
            setDate(new Date().toISOString());
            setReceiptUri(null);
        }
    }, [visible, defaultCategory]);

    const handleSave = () => {
        const parsed = parseFloat(amount.replace(',', '.')) || 0;
        onSave({
            title: title.trim() || 'Expense',
            amount: parsed,
            category: category || undefined,
            date,
            receiptUri,
        });
        onClose();
    };

    return (
        <>
            <Modal visible={visible} animationType="slide" transparent>
                <View style={styles.backdrop}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                        <View style={styles.sheet}>
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Add Expense</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <IconSymbol name="xmark" size={20} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={styles.form}>
                                <Text style={styles.label}>Title</Text>
                                <TextInput
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="e.g. Groceries"
                                    style={styles.input}
                                />

                                <Text style={styles.label}>Amount</Text>
                                <TextInput
                                    value={amount}
                                    onChangeText={setAmount}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    style={styles.input}
                                />

                                <Text style={styles.label}>Category</Text>
                                <TextInput
                                    value={category}
                                    onChangeText={setCategory}
                                    placeholder="e.g. Food"
                                    style={styles.input}
                                />

                                <Text style={styles.label}>Receipt</Text>
                                <View style={styles.row}>
                                    <TouchableOpacity
                                        style={styles.attachBtn}
                                        onPress={() => setScanModalVisible(true)}
                                        activeOpacity={0.8}
                                    >
                                        <IconSymbol name="camera" size={18} color="#6b5aed" />
                                        <Text style={styles.attachText}>Scan / Attach</Text>
                                    </TouchableOpacity>

                                    {receiptUri ? (
                                        <Image source={{ uri: receiptUri }} style={styles.preview} />
                                    ) : (
                                        <View style={styles.previewPlaceholder}>
                                            <IconSymbol name="camera" size={20} color="#9ca3af" />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.actions}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.saveBtn, { opacity: Number(Boolean(title && amount)) }]}
                                        onPress={handleSave}
                                        disabled={!title || !amount}
                                    >
                                        <Text style={styles.saveText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <ScanReceiptModal
                visible={scanModalVisible}
                onClose={() => setScanModalVisible(false)}
                onPick={(uri) => {
                    setReceiptUri(uri);
                    setScanModalVisible(false);
                }}
            />
        </>
    );
};

type ScanReceiptModalProps = {
    visible: boolean;
    onClose: () => void;
    onPick: (uri: string) => void;
};

export const ScanReceiptModal: React.FC<ScanReceiptModalProps> = ({ visible, onClose, onPick }) => {
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
    const [pickedUri, setPickedUri] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.getCameraPermissionsAsync();
            setPermissionGranted(status === 'granted');
        })();
    }, []);

    const pickFromLibrary = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });
            if (!result.canceled) {
                const uri = Array.isArray(result.assets) ? result.assets[0].uri : (result as any).uri;
                setPickedUri(uri);
                onPick(uri);
            }
        } catch (e) {
            // ignore
        }
    };

    const takePhoto = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.status !== 'granted') {
                setPermissionGranted(false);
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });
            if (!result.canceled) {
                const uri = Array.isArray(result.assets) ? result.assets[0].uri : (result as any).uri;
                setPickedUri(uri);
                onPick(uri);
            }
        } catch (e) {
            // ignore
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.backdrop}>
                <View style={[styles.sheet, { maxHeight: 360 }]}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Scan Receipt</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <IconSymbol name="xmark" size={20} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ padding: 16 }}>
                        <Text style={styles.label}>Choose how to attach receipt</Text>

                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                            <TouchableOpacity style={styles.pickBtn} onPress={takePhoto}>
                                <IconSymbol name="camera" size={22} color="#fff" />
                                <Text style={styles.pickText}>Camera</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.pickBtn, styles.pickBtnAlt]} onPress={pickFromLibrary}>
                                <IconSymbol name="camera" size={22} color="#6b5aed" />
                                <Text style={styles.pickTextAlt}>Gallery</Text>
                            </TouchableOpacity>
                        </View>

                        {pickedUri ? (
                            <Image source={{ uri: pickedUri }} style={{ marginTop: 16, width: '100%', height: 180, borderRadius: 12 }} />
                        ) : (
                            <View style={styles.scanPlaceholder}>
                                <IconSymbol name="note" size={36} color="#9ca3af" />
                                <Text style={{ color: '#9ca3af', marginTop: 8 }}>No image selected</Text>
                            </View>
                        )}

                        <View style={[styles.actions, { marginTop: 12 }]}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: '#00000066',
        justifyContent: 'flex-end',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingBottom: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    closeBtn: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 8,
    },
    form: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    label: {
        fontSize: 13,
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    attachBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#eef2ff',
    },
    attachText: {
        color: '#6b5aed',
        marginLeft: 4,
    },
    preview: {
        width: 56,
        height: 56,
        borderRadius: 8,
        marginLeft: 12,
        backgroundColor: '#fff',
    },
    previewPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 8,
        marginLeft: 12,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 16,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cancelText: {
        color: '#374151',
        fontWeight: '600',
    },
    saveBtn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: '#6b5aed',
    },
    saveText: {
        color: '#fff',
        fontWeight: '700',
    },
    pickBtn: {
        flex: 1,
        backgroundColor: '#6b5aed',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        gap: 8,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    pickBtnAlt: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    pickText: {
        color: '#fff',
        marginLeft: 8,
        fontWeight: '600',
    },
    pickTextAlt: {
        color: '#6b5aed',
        marginLeft: 8,
        fontWeight: '600',
    },
    scanPlaceholder: {
        marginTop: 16,
        height: 160,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e6e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

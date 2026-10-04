import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { PersistStorage, StorageValue } from "zustand/middleware";

export type PersistedAuthState = {
    token: string | null;
    isAuthenticated: boolean;
};

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

// SecureStore is not available on web, so the session stays in AsyncStorage there.
const isSecureStoreSupported = Platform.OS !== "web";

const parse = (raw: string | null): StorageValue<PersistedAuthState> | null => {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

// One-time migration of the session saved by older app versions in AsyncStorage.
const migrateFromAsyncStorage = async (name: string): Promise<StorageValue<PersistedAuthState> | null> => {
    const legacyRaw = await AsyncStorage.getItem(name);
    if (!legacyRaw) return null;

    const legacy = parse(legacyRaw);
    if (legacy?.state?.token) {
        try {
            await SecureStore.setItemAsync(name, legacyRaw, SECURE_STORE_OPTIONS);
        } catch {
            // Keep the legacy entry so the migration can be retried on next launch.
            return legacy;
        }
    }
    await AsyncStorage.removeItem(name);
    return legacy;
};

export const secureAuthStorage: PersistStorage<PersistedAuthState> = {
    getItem: async (name) => {
        if (!isSecureStoreSupported) {
            return parse(await AsyncStorage.getItem(name));
        }

        const stored = parse(await SecureStore.getItemAsync(name, SECURE_STORE_OPTIONS));
        if (stored) {
            await AsyncStorage.removeItem(name).catch(() => { });
            return stored;
        }
        return migrateFromAsyncStorage(name);
    },

    setItem: async (name, value) => {
        if (!isSecureStoreSupported) {
            await AsyncStorage.setItem(name, JSON.stringify(value));
            return;
        }

        if (!value.state?.token) {
            await SecureStore.deleteItemAsync(name, SECURE_STORE_OPTIONS);
            return;
        }
        await SecureStore.setItemAsync(name, JSON.stringify(value), SECURE_STORE_OPTIONS);
    },

    removeItem: async (name) => {
        if (!isSecureStoreSupported) {
            await AsyncStorage.removeItem(name);
            return;
        }
        await SecureStore.deleteItemAsync(name, SECURE_STORE_OPTIONS);
    },
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { secureAuthStorage } from "../secureAuthStorage";

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-secure-store", () => {
    const items = new Map<string, string>();
    return {
        WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
        getItemAsync: jest.fn(async (key: string) => items.get(key) ?? null),
        setItemAsync: jest.fn(async (key: string, value: string) => {
            items.set(key, value);
        }),
        deleteItemAsync: jest.fn(async (key: string) => {
            items.delete(key);
        }),
    };
});

const KEY = "auth-store";
const loggedIn = { state: { token: "jwt-token", isAuthenticated: true }, version: 0 };
const loggedOut = { state: { token: null, isAuthenticated: false }, version: 0 };

beforeEach(async () => {
    await AsyncStorage.clear();
    await SecureStore.deleteItemAsync(KEY);
    jest.clearAllMocks();
});

describe("secureAuthStorage", () => {
    it("saves the token in SecureStore and not in AsyncStorage", async () => {
        await secureAuthStorage.setItem(KEY, loggedIn);

        expect(await SecureStore.getItemAsync(KEY)).toBe(JSON.stringify(loggedIn));
        expect(await AsyncStorage.getItem(KEY)).toBeNull();
        expect(await secureAuthStorage.getItem(KEY)).toEqual(loggedIn);
    });

    it("migrates a session saved by an older version from AsyncStorage", async () => {
        await AsyncStorage.setItem(KEY, JSON.stringify(loggedIn));

        expect(await secureAuthStorage.getItem(KEY)).toEqual(loggedIn);
        expect(await SecureStore.getItemAsync(KEY)).toBe(JSON.stringify(loggedIn));
        expect(await AsyncStorage.getItem(KEY)).toBeNull();
    });

    it("keeps the legacy entry when writing to SecureStore fails", async () => {
        await AsyncStorage.setItem(KEY, JSON.stringify(loggedIn));
        (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error("keychain unavailable"));

        expect(await secureAuthStorage.getItem(KEY)).toEqual(loggedIn);
        expect(await AsyncStorage.getItem(KEY)).toBe(JSON.stringify(loggedIn));
    });

    it("drops a legacy entry without a token instead of migrating it", async () => {
        await AsyncStorage.setItem(KEY, JSON.stringify(loggedOut));

        expect(await secureAuthStorage.getItem(KEY)).toEqual(loggedOut);
        expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
        expect(await AsyncStorage.getItem(KEY)).toBeNull();
    });

    it("removes a leftover AsyncStorage entry when SecureStore already has the session", async () => {
        await SecureStore.setItemAsync(KEY, JSON.stringify(loggedIn));
        await AsyncStorage.setItem(KEY, JSON.stringify(loggedIn));

        expect(await secureAuthStorage.getItem(KEY)).toEqual(loggedIn);
        expect(await AsyncStorage.getItem(KEY)).toBeNull();
    });

    it("deletes the token from SecureStore on logout", async () => {
        await secureAuthStorage.setItem(KEY, loggedIn);
        await secureAuthStorage.setItem(KEY, loggedOut);

        expect(await SecureStore.getItemAsync(KEY)).toBeNull();
        expect(await secureAuthStorage.getItem(KEY)).toBeNull();
    });

    it("returns null when nothing is stored", async () => {
        expect(await secureAuthStorage.getItem(KEY)).toBeNull();
    });
});

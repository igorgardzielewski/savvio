import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useUserStore } from "./userStore";
export type AuthState = {
    token: string | null;
    isAuthenticated: boolean;
    needsVerification: boolean;
    pendingEmail: string | null;
    loading: boolean;
    error: string | null;
    errorFields: Record<string, string> | null;
    login: (email: string, password: string) => Promise<void>;
    register: (
        email: string,
        password: string,
        matchPassword: string,
        firstName: string,
        lastName: string,
        dateOfBirth?: string | undefined
    ) => Promise<void>;
    verify: (email: string, code: string) => Promise<void>;
    resendVerification: (email: string) => Promise<void>;
    googleSignIn: () => Promise<void>;
    logout: () => void;
    clearError: () => void;
    clearFieldErrors: () => void;
    refreshToken: () => Promise<boolean>;
    checkAndRefreshToken: () => Promise<boolean>;
};

const AUTH_LOGIN_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`;
const AUTH_REGISTER_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/register`;
const AUTH_VERIFY_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/verify-email`;
const AUTH_RESEND_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/resend-verification`;
const AUTH_GOOGLE_SIGNIN_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/google-signin`;
const AUTH_REFRESH_TOKEN_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh-token`;

const decodeJWT = (token: string): { exp?: number } | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

const isTokenExpiringSoon = (token: string, hoursThreshold: number = 1): boolean => {
    const decoded = decodeJWT(token);
    if (!decoded?.exp) return true;
    const expirationTime = decoded.exp * 1000;
    const now = Date.now();
    const threshold = hoursThreshold * 60 * 60 * 1000;
    return expirationTime - now < threshold;
};

const isTokenExpired = (token: string): boolean => {
    const decoded = decodeJWT(token);
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            isAuthenticated: false,
            needsVerification: false,
            pendingEmail: null,
            loading: false,
            error: null,
            errorFields: null,

            clearError: () => set({ error: null }),
            clearFieldErrors: () => set({ errorFields: null }),

            login: async (email, password) => {
                set({ loading: true, error: null, errorFields: null });
                try {
                    const res = await fetch(AUTH_LOGIN_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });
                    const data = await res.json().catch(() => null);

                    if (!res.ok) {
                        console.log('Login error response:', JSON.stringify(data, null, 2));
                        let message = data?.message || "Login failed";
                        let fieldErrors: Record<string, string> | null = null;
                        if (data?.field && data?.message) {
                            fieldErrors = { [data.field]: data.message };
                        } else if (Array.isArray(data?.errors)) {
                            fieldErrors = data.errors.reduce((acc: any, curr: any) => {
                                if (curr?.field && curr?.message) acc[curr.field] = curr.message;
                                return acc;
                            }, {});
                        } else if (data?.validationErrors && typeof data.validationErrors === 'object') {
                            fieldErrors = Object.entries(data.validationErrors).reduce((acc: any, [k, v]: any) => {
                                acc[k] = Array.isArray(v) ? v[0] : v;
                                return acc;
                            }, {});
                        }
                        set({ error: message, errorFields: fieldErrors, isAuthenticated: false, needsVerification: false, pendingEmail: null, token: null });
                        return;
                    }
                    const emailVerified = !!data?.user?.emailVerified;
                    set({
                        token: data.token || null,
                        isAuthenticated: emailVerified,
                        needsVerification: !emailVerified,
                        pendingEmail: emailVerified ? null : (data?.user?.email || email),
                    });
                    useUserStore.getState().setUser(data.user || { email });
                } catch (e: any) {
                    set({ error: e.message || "Unexpected login error", isAuthenticated: false });
                } finally {
                    set({ loading: false });
                }
            },

            register: async (email, password, matchPassword, firstName, lastName, dateOfBirth) => {
                set({ loading: true, error: null, errorFields: null });
                try {
                    const res = await fetch(AUTH_REGISTER_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email,
                            password,
                            matchPassword,
                            firstName,
                            lastName,
                            dateOfBirth,
                        }),
                    });
                    const data = await res.json().catch(() => null);

                    if (!res.ok) {
                        let message = data?.message || "Register failed";
                        let fieldErrors: Record<string, string> | null = null;
                        if (data?.field && data?.message) {
                            fieldErrors = { [data.field]: data.message };
                        } else if (Array.isArray(data?.errors)) {
                            fieldErrors = data.errors.reduce((acc: any, curr: any) => {
                                if (curr?.field && curr?.message) acc[curr.field] = curr.message;
                                return acc;
                            }, {});
                        } else if (data?.validationErrors && typeof data.validationErrors === 'object') {
                            fieldErrors = Object.entries(data.validationErrors).reduce((acc: any, [k, v]: any) => {
                                acc[k] = Array.isArray(v) ? v[0] : v;
                                return acc;
                            }, {});
                        }
                        set({ error: message, errorFields: fieldErrors, isAuthenticated: false, needsVerification: false, pendingEmail: null, token: null });
                        return;
                    }
                    const emailVerified = !!data?.user?.emailVerified;
                    set({
                        token: data.token || null,
                        isAuthenticated: emailVerified,
                        needsVerification: !emailVerified,
                        pendingEmail: emailVerified ? null : (data?.user?.email || email),
                    });
                    useUserStore.getState().setUser(data.user || { email, firstName, lastName });
                } catch (e: any) {
                    set({ error: e.message || "Unexpected register error", isAuthenticated: false });
                } finally {
                    set({ loading: false });
                }
            },

            verify: async (email, code) => {
                set({ loading: true, error: null, errorFields: null });
                try {
                    const res = await fetch(AUTH_VERIFY_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, verificationCode: code })
                    });
                    const data = await res.json().catch(() => null);
                    if (!res.ok) {
                        let message = data?.message || 'Verification failed';
                        let fieldErrors: Record<string, string> | null = null;
                        if (data?.field && data?.message) {
                            fieldErrors = { [data.field]: data.message };
                        } else if (Array.isArray(data?.errors)) {
                            fieldErrors = data.errors.reduce((acc: any, curr: any) => {
                                if (curr?.field && curr?.message) acc[curr.field] = curr.message;
                                return acc;
                            }, {});
                        }
                        set({ error: message, errorFields: fieldErrors });
                        return;
                    }
                    useUserStore.getState().updateUser({ emailVerified: true });
                    set({ isAuthenticated: true, needsVerification: false, error: null });
                } catch (e: any) {
                    set({ error: e.message || 'Unexpected verify error' });
                } finally {
                    set({ loading: false });
                }
            },

            resendVerification: async (email) => {
                set({ loading: true, error: null, errorFields: null });
                try {
                    const res = await fetch(AUTH_RESEND_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    const data = await res.json().catch(() => null);
                    if (!res.ok) {
                        let message = data?.message || 'Could not resend verification code';
                        let fieldErrors: Record<string, string> | null = null;
                        if (data?.field && data?.message) fieldErrors = { [data.field]: data.message };
                        set({ error: message, errorFields: fieldErrors });
                        return;
                    }
                } catch (e: any) {
                    set({ error: e.message || 'Unexpected resend error' });
                } finally {
                    set({ loading: false });
                }
            },

            googleSignIn: async () => {
                set({ loading: true, error: null, errorFields: null });
                try {
                    const { signInWithGoogle } = await import('@/helpers/googleSignInHelpers');
                    const result = await signInWithGoogle();

                    if (!result.success) {
                        set({ error: result.error || 'Google Sign-In failed', isAuthenticated: false });
                        return;
                    }

                    const res = await fetch(AUTH_GOOGLE_SIGNIN_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken: result.idToken, accessToken: result.accessToken, refreshToken: result.refreshToken, tokenExpiry: result.expiresAt, gmailAccessGranted: result.hasEmailScope }),
                    });
                    const data = await res.json().catch(() => null);

                    if (!res.ok) {
                        let message = data?.message || 'Google Sign-In backend error';
                        set({ error: message, isAuthenticated: false });
                        return;
                    }

                    set({
                        token: data.token || null,
                        isAuthenticated: true,
                        needsVerification: false,
                        pendingEmail: null,
                    });
                    useUserStore.getState().setUser(data.user || result.user);
                } catch (e: any) {
                    set({ error: e.message || 'Unexpected Google Sign-In error', isAuthenticated: false });
                } finally {
                    set({ loading: false });
                }
            },

            refreshToken: async () => {
                const currentToken = get().token;
                if (!currentToken) {
                    get().logout();
                    return false;
                }

                try {
                    const res = await fetch(AUTH_REFRESH_TOKEN_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`,
                        },
                    });

                    if (!res.ok) {
                        get().logout();
                        return false;
                    }

                    const data = await res.json().catch(() => null);
                    if (data?.token) {
                        set({ token: data.token });
                        if (data.user) {
                            useUserStore.getState().setUser(data.user);
                        }
                        return true;
                    } else {
                        get().logout();
                        return false;
                    }
                } catch (error) {
                    get().logout();
                    return false;
                }
            },

            checkAndRefreshToken: async () => {
                const currentToken = get().token;
                if (!currentToken) {
                    return false;
                }

                if (isTokenExpired(currentToken)) {
                    get().logout();
                    return false;
                }

                if (isTokenExpiringSoon(currentToken, 24)) {
                    return await get().refreshToken();
                }

                return true;
            },

            logout: () => {
                set({ token: null, isAuthenticated: false, needsVerification: false, pendingEmail: null });
                useUserStore.getState().clearUser();
            },
        }),
        {
            name: "auth-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.token && state?.isAuthenticated) {
                    setTimeout(() => {
                        state.checkAndRefreshToken();
                    }, 100);
                }
            },
        }
    )
);

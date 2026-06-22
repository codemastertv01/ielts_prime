// stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ─── Types ────────────────────────────────────────────────────

export interface AuthUser {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    avatarUrl?: string;
    role?: string;
    permission: string[];
}

export interface LoginResponse {
    message: string;
    redirect: boolean;
    success: boolean;
    url: string;
    verificationExpiresAt?: string;
    user: AuthUser;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
}

interface AuthActions {
    setAuth: (data: LoginResponse) => void;
    updateUser: (userData: Partial<AuthUser>) => void;
    clearAuth: () => void;
    logout: () => void;
    setToken: (token: string) => void;
    getToken: () => string | null;
}

export type AuthStore = AuthState & AuthActions;

const INITIAL: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

// ─── Store ────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
    persist(
        immer<AuthStore>((set, get) => ({
            ...INITIAL,

            setAuth: (data) =>
                set((s) => {
                    console.log("dataUser", data)
                    s.user = data.user;
                    s.token = data.user.token;
                    s.isAuthenticated = true;
                }),

            updateUser: (userData) =>
                set((s) => {
                    if (s.user) Object.assign(s.user, userData);
                }),

            clearAuth: () =>
                set((s) => {
                    Object.assign(s, INITIAL);
                }),

            logout: () =>
                set((s) => {
                    Object.assign(s, INITIAL);
                }),

            setToken: (token) =>
                set((s) => {
                    s.token = token;
                    if (s.user) s.user.token = token;
                }),

            getToken: () => get().token,
        })),
        {
            name: 'IELTS_AUTH',
            storage: createJSONStorage(() => {
                if (typeof window === 'undefined') return sessionStorage;
                return localStorage;
            }),
            partialize: (s) => ({
                user: s.user,
                token: s.token,
                isAuthenticated: s.isAuthenticated,
            }),
        }
    )
);

// hooks/useAuth.ts
'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { authAPI } from '@/services/authAPI';
import { showToast } from '@/services/toastService';
import type { LoginResponse } from '@/stores/authStore';
import { useAuthStore } from '@/stores/authStore';

// ─── Payload types (export — pages ichida ishlatiladi) ────────────────────────
export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

export interface VerifyPayload {
    email: string;
    code: string;
}

export interface ResetPasswordPayload {
    token: string;
    password: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}

export interface GooglePayload {
    code: string;
}

// ─── Client-side rate limiter ─────────────────────────────────────────────────
// Backend rate limit aldiga birinchi qatlam
const rateLimiter = (() => {
    const map = new Map<string, { count: number; first: number }>();
    const LIMIT = 5;
    const WINDOW = 60_000;

    return {
        check(key: string): boolean {
            const now = Date.now();
            const rec = map.get(key) ?? { count: 0, first: now };
            if (now - rec.first > WINDOW) {
                map.set(key, { count: 1, first: now });
                return true;
            }
            if (rec.count >= LIMIT) return false;
            map.set(key, { ...rec, count: rec.count + 1 });
            return true;
        },
        reset(key: string) {
            map.delete(key);
        },
    };
})();

// ─── Simple sanitizer (DOMPurify SSR safe wrapper) ───────────────────────────
function sanitize(value: string): string {
    if (typeof window === 'undefined') return value;
    // DOMPurify faqat browserda mavjud
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const DOMPurify = require('dompurify');
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
}

function sanitizeObj<T extends object>(obj: T): T {
    const out = { ...obj };
    for (const key of Object.keys(out) as Array<keyof T>) {
        const v = out[key];
        if (typeof v === 'string') (out as Record<keyof T, unknown>)[key] = sanitize(v);
    }
    return out;
}

// ─── useAuth ──────────────────────────────────────────────────────────────────
export const useAuth = () => {
    const router = useRouter();
    const qc = useQueryClient();

    const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    const loginMutation = useMutation<LoginResponse, AxiosError<ApiError>, LoginPayload>({
        mutationFn: async (raw) => {
            const data = sanitizeObj(raw);

            if (!rateLimiter.check(`login:${data.email}`)) throw new Error("Juda ko'p urinish. 1 daqiqa kuting.");
            return authAPI.login(data);
        },
        onSuccess: (data) => {
            setAuth(data);
            rateLimiter.reset(`login:${data.user.email}`);
            qc.invalidateQueries({ queryKey: ['user'] });
            const name = [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || data.user.username || data.user.email;
            showToast.success(`Welcome, ${name}!`);
            router.push('/dashboard');
        },
        onError: (err) => {
            showToast.error(err.response?.data?.message ?? 'Login amalga oshmadi');
        },
    });

    // ── REGISTER ──────────────────────────────────────────────────────────────
    const registerMutation = useMutation<void, AxiosError<ApiError>, RegisterPayload>({
        mutationFn: async (raw) => {
            const data = sanitizeObj(raw);
            if (!rateLimiter.check(`register:${data.email}`)) throw new Error("Juda ko'p urinish");
            await authAPI.register(data);
        },
        onSuccess: (_data, vars) => {
            showToast.success("Ro'yxatdan o'tdingiz! Emailni tasdiqlang.");
            router.push(`/auth/verification?email=${encodeURIComponent(vars.email)}`);
        },
        onError: (err) => {
            showToast.error(err.response?.data?.message ?? "Ro'yxatdan o'tish amalga oshmadi");
        },
    });

    // ── LOGOUT ────────────────────────────────────────────────────────────────
    // const logoutMutation = useMutation<void, AxiosError>({
    //     mutationFn: async () => {
    //         await authAPI.logout();
    //     },
    //     onSettled: () => {
    //         clearAuth();
    //         qc.clear();
    //         router.replace('/auth/login');
    //     },
    // });

    // ── SEND VERIFICATION CODE ────────────────────────────────────────────────
    const sendVerificationMutation = useMutation<void, AxiosError<ApiError>, string>({
        mutationFn: async (email) => {
            const clean = sanitize(email);
            if (!rateLimiter.check(`verify:${clean}`)) throw new Error("Juda ko'p so'rov");
            await authAPI.sendVerificationCode(clean);
        },
        onSuccess: () => showToast.success('Tasdiqlash kodi yuborildi'),
        onError: (err) => showToast.error(err.response?.data?.message ?? "Kod yuborib bo'lmadi"),
    });

    // ── CONFIRM VERIFICATION CODE ─────────────────────────────────────────────
    const confirmVerificationMutation = useMutation<void, AxiosError<ApiError>, VerifyPayload>({
        mutationFn: async ({ email, code }) => {
            await authAPI.confirmVerificationCode(sanitize(email), sanitize(code));
        },
        onSuccess: () => {
            showToast.success('Email tasdiqlandi!');
            router.push('/auth/login');
        },
        onError: (err) => {
            showToast.error(err.response?.data?.message ?? "Kod noto'g'ri");
            throw err; // caller catch qilishi uchun
        },
    });

    // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
    const forgotPasswordMutation = useMutation<void, AxiosError<ApiError>, string>({
        mutationFn: async (email) => {
            await authAPI.forgotPassword(sanitize(email));
        },
        onSuccess: () => showToast.success('Parolni tiklash havolasi yuborildi'),
        onError: (err) => showToast.error(err.response?.data?.message ?? "Yuborib bo'lmadi"),
    });

    // ── RESET PASSWORD ────────────────────────────────────────────────────────
    const resetPasswordMutation = useMutation<void, AxiosError<ApiError>, ResetPasswordPayload>({
        mutationFn: async ({ token, password }) => {
            await authAPI.resetPassword(sanitize(token), password);
        },
        onSuccess: () => {
            showToast.success('Parol muvaffaqiyatli yangilandi');
            router.push('/auth/login');
        },
        onError: (err) => showToast.error(err.response?.data?.message ?? "Yangilab bo'lmadi"),
    });

    // ── SOCIAL LOGIN (Google) ─────────────────────────────────────────────────
    const googleMutation = useMutation<LoginResponse, AxiosError<ApiError>, GooglePayload>({
        mutationFn: async (raw) => {
            const data = sanitizeObj(raw);

            if (!rateLimiter.check(`login:${data.code}`)) throw new Error("Juda ko'p urinish. 1 daqiqa kuting.");
            return authAPI.google(data);
        },
        onSuccess: (data) => {
            setAuth(data);
            rateLimiter.reset(`login:${data.user.email}`);
            qc.invalidateQueries({ queryKey: ['user'] });
            const name = [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || data.user.username || data.user.email;
            showToast.success(`Welcome, ${name}!`);
            router.push('/dashboard');
        },
        onError: (err) => {
            showToast.error(err.response?.data?.message ?? 'Google orqali kirish amalga oshmadi');
        },
    });

    // ─── Return ───────────────────────────────────────────────────────────────
    return {
        // State
        user,
        token,
        isAuthenticated,
        isLoading: loginMutation.isPending || registerMutation.isPending, // || logoutMutation.isPending,

        // Individual loading states (page-level spinners uchun)
        isLoginLoading: loginMutation.isPending,
        isRegisterLoading: registerMutation.isPending,
        // isLogoutLoading: logoutMutation.isPending,
        isVerifyLoading: confirmVerificationMutation.isPending || sendVerificationMutation.isPending,
        isForgotLoading: forgotPasswordMutation.isPending,
        isResetLoading: resetPasswordMutation.isPending,
        isSocialLoading: googleMutation.isPending,

        // Actions
        login: useCallback((d: LoginPayload) => loginMutation.mutateAsync(d), [loginMutation]),

        register: useCallback((d: RegisterPayload) => registerMutation.mutateAsync(d), [registerMutation]),

        // logout: useCallback(() => logoutMutation.mutateAsync(), [logoutMutation]),

        sendVerificationCode: useCallback((e: string) => sendVerificationMutation.mutateAsync(e), [sendVerificationMutation]),

        confirmVerificationCode: useCallback((p: VerifyPayload) => confirmVerificationMutation.mutateAsync(p), [confirmVerificationMutation]),

        forgotPassword: useCallback((e: string) => forgotPasswordMutation.mutateAsync(e), [forgotPasswordMutation]),

        resetPassword: useCallback((d: ResetPasswordPayload) => resetPasswordMutation.mutateAsync(d), [resetPasswordMutation]),

        google: useCallback((code: GooglePayload) => googleMutation.mutateAsync(code), [googleMutation]),
    };
};

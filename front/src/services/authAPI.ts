import { LoginPayload, RegisterPayload } from '@/types/useAuth';
import type { LoginResponse } from '@/stores/authStore';
import apiClient, { unwrap } from './apiClient';

export const authAPI = {
    login: (data: LoginPayload) => unwrap<LoginResponse>(apiClient.post('/auth/login', data)),
    register: (data: RegisterPayload) => unwrap<void>(apiClient.post('/auth/register', data)),
    google: (data: { code: string }) => unwrap<LoginResponse>(apiClient.post('/auth/google', data)),
    sendVerificationCode: (email: string) => unwrap<void>(apiClient.post('/auth/send/verification/code', { email })),
    confirmVerificationCode: (email: string, code: string) => unwrap<void>(apiClient.post('/auth/confirm/verification/code', { email, verificationcode: code })),
    forgotPassword: (email: string) => unwrap<void>(apiClient.post('/auth/forgot-password', { email })),
    resetPassword: (token: string, password: string) => unwrap<void>(apiClient.post(`/auth/reset-password/${token}`, { password })),
};

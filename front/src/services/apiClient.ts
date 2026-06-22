import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { showToast } from './toastService';

const env: string = process.env.NODE || 'dev';
const API_BASE = env === 'development' || env === 'dev' ? 'http://localhost:8000/api/v1' : 'https://edu-forge-server.vercel.app/api/v1';

const LOGIN_PATH = '/auth/login';
let isRedirectingToLogin = false;

const redirectToLogin = () => {
    if (typeof window === 'undefined' || isRedirectingToLogin) return;

    isRedirectingToLogin = true;

    const currentPath = `${window.location.pathname}${window.location.search}`;
    const loginUrl = new URL(LOGIN_PATH, window.location.origin);

    if (currentPath !== LOGIN_PATH) {
        loginUrl.searchParams.set('redirect', currentPath);
    }

    window.location.replace(loginUrl.toString());
};

export const apiClient = axios.create({
    baseURL: API_BASE,
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (typeof document !== 'undefined') {
            const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
            if (csrf?.content) config.headers['X-CSRF-TOKEN'] = csrf.content;
        }

        config.headers['X-Request-Time'] = Date.now().toString();
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!axios.isAxiosError(error)) return Promise.reject(error);

        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!error.response) {
            showToast.error('Internet bilan aloqa uzildi. Ulanishni tekshirib qayta urinib koring.', {
                id: 'network-error',
            });
            return Promise.reject(error);
        }

        const { status } = error.response;

        if (status === 401 && !original?._retry) {
            original._retry = true;

            useAuthStore.getState().logout?.();

            showToast.error('Sessiya muddati tugadi. Qayta login qiling.', {
                id: 'session-expired',
                duration: 3500,
            });

            setTimeout(redirectToLogin, 700);
            return Promise.reject(error);
        }

        if (status === 403) {
            showToast.error('Bu amal uchun ruxsat yoq.', { id: 'forbidden' });
        }

        if (status === 429) {
            const retryAfter = error.response.headers['retry-after'] as string | undefined;
            showToast.error(`Juda kop sorov yuborildi. ${retryAfter ? `${retryAfter}s dan keyin urinib koring.` : 'Keyinroq urinib koring.'}`, {
                id: 'rate-limit',
            });
        }

        if (status >= 500) {
            showToast.error('Serverda muammo yuz berdi. Birozdan keyin qayta urinib koring.', {
                id: 'server-error',
            });
        }

            showToast.error(error.message || 'Serverda muammo yuz berdi. Birozdan keyin qayta urinib koring.');

        return Promise.reject(error);
    }
);

export function cleanParams(params?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!params) return undefined;

    return Object.fromEntries(
        Object.entries(params)
            .filter(([, value]) => value !== '' && value !== undefined && value !== null)
            .map(([key, value]) => [key, key === 'limit' && value === 'all' ? 0 : value])
    );
}

type ApiEnvelope<T> = {
    success?: boolean;
    data?: T;
    message?: string;
    [key: string]: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Axios response va backend envelope formatlarini bitta joyda tozalaydi.
 * - { success, data, message } -> data
 * - { success, ...payload }    -> payload
 * - oddiy payload              -> payload
 */
// Existing services can omit T while gradually migrating to explicit response types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const unwrap = async <T = any>(request: Promise<AxiosResponse<unknown>>): Promise<T> => {
    const response = await request;
    const payload = response.data;

    if (!isRecord(payload)) return payload as T;

    const envelope = payload as ApiEnvelope<T>;
    if ('data' in envelope) {
        const meaningfulKeys = Object.keys(envelope).filter((key) => !['success', 'message', 'data', 'count', 'statusCode', 'timestamp'].includes(key));
        if (meaningfulKeys.length === 0) return envelope.data as T;
    }

    const isPaginatedPayload = ['total', 'page', 'totalPages', 'hasNext', 'hasPrev'].some((key) => key in envelope);
    if (isPaginatedPayload && ('success' in envelope || 'message' in envelope)) {
        return Object.fromEntries(Object.entries(envelope).filter(([key]) => key !== 'success' && key !== 'message')) as T;
    }

    return payload as T;
};



export const analyticsAPI = {
    getUserAnalytics: <T>() => unwrap<T>(apiClient.get('/ielts/analytics/user')),
    getExamStatistics: <T>(examId: string) => unwrap<T>(apiClient.get(`/ielts/analytics/exam/${examId}`)),
    getUserReport: <T>(attemptId: string) => unwrap<T>(apiClient.get(`/ielts/analytics/report/${attemptId}`)),
    getCertificate: <T>(attemptId: string) => unwrap<T>(apiClient.get(`/ielts/analytics/certificate/${attemptId}`)),
};

export default apiClient;

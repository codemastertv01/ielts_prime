export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verification',
};

export const TOAST_CONFIG = {
    position: 'top-right',
    duration: 4000,
    style: {
        background: 'var(--bg-color)',
        color: 'var(--text-color)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
    },
};

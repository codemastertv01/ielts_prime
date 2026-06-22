'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from './authAPI';
import { showToast } from './toastService';

const GoogleIcon = () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path d="M12 4.75c1.77 0 3.36.61 4.61 1.8l3.42-3.42C17.95 1.19 15.23 0 12 0 7.31 0 3.26 2.69 1.28 6.61l3.99 3.1C6.22 6.86 8.87 4.75 12 4.75z" fill="#EA4335" />
        <path d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.12 2.74-2.38 3.58l3.86 3c2.26-2.09 3.54-5.17 3.54-8.82z" fill="#4285F4" />
        <path d="M5.26 14.29c-.25-.73-.39-1.5-.39-2.29s.14-1.56.39-2.29L1.27 6.61A11.94 11.94 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l3.99-3.1z" fill="#FBBC05" />
        <path d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.86-3c-1.07.72-2.45 1.15-4.09 1.15-3.13 0-5.78-2.11-6.74-4.96l-3.99 3.1C3.26 21.31 7.31 24 12 24z" fill="#34A853" />
    </svg>
);

export default function GoogleAuthButton({ title, isSocialLoading }: { title: string; isSocialLoading: boolean }) {
    const goTo = useRouter();
    const { setAuth } = useAuthStore();

    const handleGoogleLogin = useGoogleLogin({
        flow: 'auth-code',
        scope: 'openid email profile',
        redirect_uri: '',
        onSuccess: async (codeResponse) => {
            try {
                const data = await authAPI.google({ code: codeResponse.code });

                if (data?.redirect && data?.url && data.verificationExpiresAt) {
                    goTo.push(data?.url);
                }
                if (data?.success) {
                    showToast.success(data?.message);
                    setAuth(data);
                    goTo.push('/dashboard');
                }
            } catch (err: unknown) {
                console.error('Backend login xatosi:', err);
            }
        },
        onError: () => {
            showToast.error('Google login failed');
        },
    });

    return (
        <motion.button type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} disabled={isSocialLoading} onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
            {isSocialLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
            {isSocialLoading ? 'Kirish...' : title}
        </motion.button>
    );
}

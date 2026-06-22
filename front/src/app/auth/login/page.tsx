'use client';
import FadeIn from '@/components/animations/FadeIn';
import SlideUp from '@/components/animations/SlideUp';
import AuthLayout from '@/components/Layout/AuthLayout';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { LoginPayload, useAuth } from '@/hooks/useAuth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Lock, LogIn, Mail } from 'lucide-react';
import Link from 'next/link';
import { memo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import GoogleAuthButton from '../../../services/googleAuthButton';

// ─── Component ────────────────────────────────────────────────────────────────
const Login = () => {
    const { login, isLoginLoading, isSocialLoading } = useAuth();
    const [showPwd, setShowPwd] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginPayload>({ mode: 'onBlur', defaultValues: { email: '', password: '' } });

    const onSubmit = (data: LoginPayload) => login(data);

    return (
        <AuthLayout title="Welcome" subtitle="Hisobingizga kiring">
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
                <SlideUp>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        {/* Email */}
                        <FadeIn delay={0.05}>
                            <Controller
                                name="email"
                                control={control}
                                rules={{
                                    required: 'Email majburiy',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email noto'g'ri" },
                                }}
                                render={({ field }) => <Input {...field} label="Email" type="email" placeholder="siz@example.com" Icon={Mail} error={errors.email?.message} autoComplete="email" required />}
                            />
                        </FadeIn>

                        {/* Password */}
                        <FadeIn delay={0.1}>
                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    required: 'Parol majburiy',
                                    minLength: { value: 3, message: 'Kamida 3 ta belgi' },
                                }}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Input {...field} label="Parol" type={showPwd ? 'text' : 'password'} placeholder="Parolingizni kiriting" Icon={Lock} error={errors.password?.message} autoComplete="current-password" required />
                                    </div>
                                )}
                            />
                        </FadeIn>

                        {/* Forget link */}
                        <div className="flex justify-end -mt-2">
                            <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                                Parolni unutdingizmi?
                            </Link>
                        </div>

                        {/* Submit */}
                        <FadeIn delay={0.15}>
                            <Button type="submit" loading={isLoginLoading} disabled={isLoginLoading} Icon={LogIn} fullWidth size="md">
                                {isLoginLoading ? 'Kirish...' : 'Kirish'}
                            </Button>
                        </FadeIn>
                    </form>
                </SlideUp>

                {/* Register link */}
                <SlideUp delay={0.3}>
                    <p className="text-center text-sm text-dark-500 dark:text-dark-400 mt-6">
                        Hisob yo'qmi?{' '}
                        <Link href="/auth/register" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-semibold transition-colors">
                            Ro'yxatdan o'ting
                        </Link>
                    </p>
                </SlideUp>

                {/* Divider */}
                <SlideUp delay={0.4}>
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-dark-200 dark:bg-dark-700" />
                        <span className="text-xs text-dark-400 dark:text-dark-500">yoki</span>
                        <div className="flex-1 h-px bg-dark-200 dark:bg-dark-700" />
                    </div>

                    <GoogleAuthButton title="Google orqali kirish" isSocialLoading={isSocialLoading} />
                </SlideUp>
            </GoogleOAuthProvider>
        </AuthLayout>
    );
};

export default memo(Login);

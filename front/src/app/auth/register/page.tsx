'use client';
import Link from 'next/link';
import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { User, Mail, Lock, UserPlus, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import FadeIn from '@/components/animations/FadeIn';
import SlideUp from '@/components/animations/SlideUp';
import AuthLayout from '@/components/Layout/AuthLayout';
import { useAuth, RegisterPayload } from '@/hooks/useAuth';

// ─── Password strength ────────────────────────────────────────────────────────
const checks = [
    { re: /.{8,}/, label: 'Kamida 8 ta belgi' },
    { re: /[A-Z]/, label: 'Katta harf (A–Z)' },
    { re: /[a-z]/, label: 'Kichik harf (a–z)' },
    { re: /\d/, label: 'Raqam (0–9)' },
    { re: /[@$!%*?&_#]/, label: 'Maxsus belgi (@$!%…)' },
];

const PasswordStrength = ({ pwd }: { pwd: string }) => {
    const passed = checks.filter((c) => c.re.test(pwd));
    const score = passed.length;

    const color = score <= 1 ? 'bg-red-500' : score <= 2 ? 'bg-orange-400' : score <= 3 ? 'bg-amber-400' : score <= 4 ? 'bg-lime-500' : 'bg-emerald-500';

    const label = score <= 1 ? 'Juda zaif' : score <= 2 ? 'Zaif' : score <= 3 ? "O'rtacha" : score <= 4 ? 'Yaxshi' : 'Kuchli';

    if (!pwd) return null;

    return (
        <div className="mt-2 space-y-2">
            {/* Progress bar */}
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-dark-200 dark:bg-dark-700'}`} />
                ))}
                <span className={`text-[10px] font-semibold ml-1 shrink-0 ${color.replace('bg-', 'text-')}`}>{label}</span>
            </div>
            {/* Checks */}
            <div className="grid grid-cols-2 gap-1">
                {checks.map((c) => {
                    const ok = c.re.test(pwd);
                    return (
                        <p key={c.label} className={`text-[11px] flex items-center gap-1.5 transition-colors ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-dark-400 dark:text-dark-600'}`}>
                            <span className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${ok ? 'border-emerald-500 bg-emerald-500' : 'border-dark-300 dark:border-dark-600'}`}>
                                {ok && (
                                    <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 8 8">
                                        <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </span>
                            {c.label}
                        </p>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Component ────────────────────────────────────────────────────────────────
const Register = () => {
    const { register: registerUser, isRegisterLoading } = useAuth();
    const [showPwd, setShowPwd] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterPayload>({
        mode: 'onBlur',
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false,
        },
    });

    const pwd = watch('password');

    const onSubmit = useCallback(
        (data: RegisterPayload) => {
            registerUser(data);
        },
        [registerUser]
    );

    return (
        <AuthLayout title="Ro'yxatdan o'tish" subtitle="Yangi hisob yarating">
            <SlideUp>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    {/* First + Last name */}
                    <div className="grid grid-cols-2 gap-4">
                        <FadeIn delay={0.05}>
                            <Controller name="firstName" control={control} rules={{ required: 'Ism majburiy', minLength: { value: 2, message: 'Kamida 2 ta harf' } }} render={({ field }) => <Input {...field} label="Ism" type="text" placeholder="Ali" Icon={User} error={errors.firstName?.message} autoComplete="given-name" required />} />
                        </FadeIn>
                        <FadeIn delay={0.08}>
                            <Controller name="lastName" control={control} rules={{ required: 'Familiya majburiy', minLength: { value: 2, message: 'Kamida 2 ta harf' } }} render={({ field }) => <Input {...field} label="Familiya" type="text" placeholder="Valiyev" Icon={User} error={errors.lastName?.message} autoComplete="family-name" required />} />
                        </FadeIn>
                    </div>

                    {/* Email */}
                    <FadeIn delay={0.11}>
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

                    {/* Username */}
                    <FadeIn delay={0.14}>
                        <Controller
                            name="username"
                            control={control}
                            rules={{
                                required: 'Foydalanuvchi nomi majburiy',
                                minLength: { value: 3, message: 'Kamida 3 ta belgi' },
                                pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Faqat harf, raqam va _' },
                            }}
                            render={({ field }) => <Input {...field} label="Foydalanuvchi nomi" type="text" placeholder="ali_valiyev" Icon={User} error={errors.username?.message} autoComplete="username" required />}
                        />
                    </FadeIn>

                    {/* Password + Confirm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FadeIn delay={0.17}>
                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    required: 'Parol majburiy',
                                    minLength: { value: 8, message: 'Kamida 8 ta belgi' },
                                    validate: (v) => checks.slice(0, 4).every((c) => c.re.test(v)) || 'Parol talablarga mos emas',
                                }}
                                render={({ field }) => (
                                    <>
                                        <Input {...field} label="Parol" type={showPwd ? 'text' : 'password'} placeholder="Kuchli parol" Icon={Lock} error={errors.password?.message} autoComplete="new-password" required />
                                        <PasswordStrength pwd={pwd} />
                                    </>
                                )}
                            />
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <Controller
                                name="confirmPassword"
                                control={control}
                                rules={{
                                    required: 'Parolni tasdiqlang',
                                    validate: (v) => v === pwd || 'Parollar mos emas',
                                }}
                                render={({ field }) => <Input {...field} label="Parolni tasdiqlang" type={showPwd ? 'text' : 'password'} placeholder="Parolni qaytaring" Icon={Lock} error={errors.confirmPassword?.message} autoComplete="new-password" required />}
                            />
                        </FadeIn>
                    </div>

                    {/* Terms */}
                    <FadeIn delay={0.23}>
                        <Controller
                            name="acceptTerms"
                            control={control}
                            rules={{ required: 'Shartlarni qabul qilishingiz shart' }}
                            render={({ field: { value, onChange } }) => (
                                <div>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div onClick={() => onChange(!value)} className={`mt-0.5 w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center  transition-all duration-150 cursor-pointer  ${value ? 'border-primary-500 bg-primary-500' : 'border-dark-300 dark:border-dark-600 group-hover:border-primary-400'}`}>
                                            {value && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 10 10">
                                                    <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">
                                            Men{' '}
                                            <Link href="/terms" className="text-primary-600 hover:underline dark:text-primary-400">
                                                Foydalanish shartlari
                                            </Link>{' '}
                                            va{' '}
                                            <Link href="/privacy" className="text-primary-600 hover:underline dark:text-primary-400">
                                                Maxfiylik siyosati
                                            </Link>{' '}
                                            ga roziman
                                        </span>
                                    </label>
                                    {errors.acceptTerms && <p className="text-xs text-red-500 dark:text-red-400 mt-1 ml-8">{errors.acceptTerms.message}</p>}
                                </div>
                            )}
                        />
                    </FadeIn>

                    {/* Submit */}
                    <FadeIn delay={0.26}>
                        <Button type="submit" loading={isRegisterLoading} disabled={isRegisterLoading} Icon={UserPlus} fullWidth size="md">
                            {isRegisterLoading ? 'Yaratilmoqda...' : 'Hisob yaratish'}
                        </Button>
                    </FadeIn>
                </form>
            </SlideUp>

            <SlideUp delay={0.35}>
                <p className="text-center text-sm text-dark-500 dark:text-dark-400 mt-6">
                    Hisob bormi?{' '}
                    <Link href="/auth/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-semibold transition-colors">
                        Kirish
                    </Link>
                </p>
            </SlideUp>
        </AuthLayout>
    );
};

export default memo(Register);

'use client';
import { useUsers } from '@/hooks/useAdminUsers';
import type { CreateUserDto } from '@/types/user';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Check, ChevronRight, Eye, EyeOff, Loader2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { inputCls, labelCls } from '../components/UserShared';

interface FormState {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    bio: string;
    avatarUrl: string;
}

const DEFAULT: FormState = { username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', bio: '', avatarUrl: '' };

function validate(form: FormState): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = 'Majburiy';
    else if (form.username.length < 3) e.username = 'Kamida 3 belgi';
    else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) e.username = 'Faqat harf, raqam, _ va -';
    if (!form.email.trim()) e.email = 'Majburiy';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email formati noto'g'ri";
    if (!form.password) e.password = 'Majburiy';
    else if (form.password.length < 8) e.password = 'Kamida 8 belgi';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = '1 katta, 1 kichik harf, 1 raqam kerak';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) e.confirmPassword = 'Parollar mos kelmadi';
    if (!form.firstName.trim()) e.firstName = 'Majburiy';
    if (!form.lastName.trim()) e.lastName = 'Majburiy';
    if (form.phone && !/^\+?[1-9]\d{1,14}$/.test(form.phone)) e.phone = "Noto'g'ri format: +998901234567";
    return e;
}

export default function CreateUserPage() {
    const router = useRouter();
    const { createAsync, isCreating } = useUsers();
    const [form, setForm] = useState<FormState>(DEFAULT);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = async () => {
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setApiError('');
        const dto: CreateUserDto = {
            username: form.username.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim() || undefined,
            bio: form.bio.trim() || undefined,
            avatarUrl: form.avatarUrl.trim() || undefined,
        };
        try {
            await createAsync(dto);
            router.push('/admin/users');
        } catch (e: unknown) {
            setApiError((e as any)?.response?.data?.message ?? (e as Error)?.message ?? 'Yaratishda xato');
        }
    };

    const F = ({ label, children, error, hint }: { label: string; children: React.ReactNode; error?: string; hint?: string }) => (
        <div>
            <label className={labelCls}>{label}</label>
            {children}
            {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
            {error && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push('/admin/users')}>
                                Foydalanuvchilar
                            </span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-600 dark:text-gray-300 font-medium">Yaratish</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" /> Foydalanuvchi yaratish
                        </h1>
                    </div>
                </div>

                <AnimatePresence>
                    {apiError && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{apiError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Identity */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Asosiy ma'lumotlar</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <F label="Ism" error={errors.firstName}>
                                <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="John" className={inputCls(errors.firstName)} />
                            </F>
                            <F label="Familiya" error={errors.lastName}>
                                <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Doe" className={inputCls(errors.lastName)} />
                            </F>
                        </div>
                        <F label="Username" error={errors.username} hint="Harf, raqam, _ va - ishlatilishi mumkin">
                            <input value={form.username} onChange={(e) => set('username', e.target.value.toLowerCase())} placeholder="john_doe" className={`${inputCls(errors.username)} font-mono`} />
                        </F>
                        <F label="Email" error={errors.email}>
                            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="john@example.com" className={inputCls(errors.email)} />
                        </F>
                        <div className="grid grid-cols-2 gap-4">
                            <F label="Parol" error={errors.password}>
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="SecurePass1" className={inputCls(errors.password)} />
                                    <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </F>
                            <F label="Parolni tasdiqlash" error={errors.confirmPassword}>
                                <div className="relative">
                                    <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="SecurePass1" className={inputCls(errors.confirmPassword)} />
                                    <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </F>
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Profil (ixtiyoriy)</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <F label="Telefon" error={errors.phone} hint="+998901234567">
                            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+998901234567" className={inputCls(errors.phone)} />
                        </F>
                        <F label="Bio">
                            <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3} placeholder="O'zingiz haqingizda qisqacha..." className={`${inputCls()} resize-none`} />
                        </F>
                        <F label="Avatar URL" hint="https://... formatida">
                            <input value={form.avatarUrl} onChange={(e) => set('avatarUrl', e.target.value)} placeholder="https://example.com/avatar.jpg" className={inputCls()} />
                        </F>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button onClick={() => router.back()} className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        Bekor
                    </button>
                    <button onClick={handleSubmit} disabled={isCreating} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Foydalanuvchi yaratish
                    </button>
                </div>
            </div>
        </div>
    );
}

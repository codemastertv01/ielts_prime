'use client';
import { useRoles } from '@/hooks/useAdminRoles';
import type { CreateRoleDto } from '@/types/role';
import { RoleType } from '@/types/role';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Check, ChevronRight, Info, Loader2, Lock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ALL_ROLE_TYPES, inputCls, labelCls } from '../components/RoleShared';

interface FormState {
    name: string;
    description: string;
    type: RoleType;
    priority: number;
    isSystemRole: boolean;
    permissions: string[];
}

const DEFAULT: FormState = {
    name: '',
    description: '',
    type: RoleType.CUSTOM,
    priority: 0,
    isSystemRole: false,
    permissions: [],
};

function validate(form: FormState): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Majburiy';
    else if (form.name.length < 2) e.name = 'Kamida 2 belgi';
    else if (!/^[a-zA-Z0-9_\s-]+$/.test(form.name)) e.name = "Faqat harf, raqam, _, - va bo'sh joy";
    if (form.priority < 0 || form.priority > 100) e.priority = "0–100 oralig'ida bo'lishi kerak";
    return e;
}

export default function CreateRolePage() {
    const router = useRouter();
    const { createAsync, isCreating } = useRoles();

    const [form, setForm] = useState<FormState>(DEFAULT);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = async () => {
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setApiError('');

        const dto: CreateRoleDto = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            type: form.type,
            priority: form.priority,
            isSystemRole: form.isSystemRole,
            permissions: form.permissions.length > 0 ? form.permissions : undefined,
        };

        try {
            await createAsync(dto);
            router.push('/admin/roles');
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
                    <AlertTriangle className="w-3 h-3" /> {error}
                </p>
            )}
        </div>
    );

    const TYPE_COLORS: Record<string, string> = {
        admin: 'bg-violet-600 text-white border-violet-600',
        user: 'bg-sky-600 text-white border-sky-600',
        moderator: 'bg-amber-600 text-white border-amber-600',
        guest: 'bg-gray-500 text-white border-gray-500',
        custom: 'bg-teal-600 text-white border-teal-600',
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <span className="hover:text-gray-600 cursor-pointer" onClick={() => router.push('/admin/roles')}>
                                Roles
                            </span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-600 dark:text-gray-300 font-medium">Yaratish</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" /> Role yaratish
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

                {/* Main form */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Role ma'lumotlari</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <F label="Role nomi" error={errors.name} hint="Harf, raqam, _, - va bo'sh joy ishlatilishi mumkin">
                            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="content-moderator" className={inputCls(errors.name)} />
                        </F>

                        <F label="Tavsif" hint="Ixtiyoriy — bu rol nima qilish imkonini beradi">
                            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Kontent moderatsiyasi bilan shug'ullanadi..." className={`${inputCls()} resize-none`} />
                        </F>

                        <F label="Tur (type)">
                            <div className="grid grid-cols-5 gap-2">
                                {ALL_ROLE_TYPES.map((t) => (
                                    <button key={t} type="button" onClick={() => set('type', t)} className={`py-2.5 text-xs font-semibold rounded-xl border transition capitalize ${form.type === t ? TYPE_COLORS[t] : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </F>

                        <F label="Prioritet (0–100)" error={errors.priority} hint="Yuqori qiymat = yuqori ustuvorlik">
                            <div className="flex items-center gap-4">
                                <input type="range" min={0} max={100} step={5} value={form.priority} onChange={(e) => set('priority', Number(e.target.value))} className="flex-1 accent-blue-600" />
                                <span className={`text-sm font-bold font-mono w-10 text-center ${form.priority >= 70 ? 'text-red-600' : form.priority >= 40 ? 'text-amber-600' : 'text-gray-600 dark:text-gray-400'}`}>{form.priority}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>0 — past</span>
                                <span>50 — o'rta</span>
                                <span>100 — yuqori</span>
                            </div>
                        </F>
                    </div>
                </div>

                {/* System role */}
                <div className={`bg-white dark:bg-gray-900 border rounded-2xl shadow-sm overflow-hidden transition ${form.isSystemRole ? 'border-violet-300 dark:border-violet-700' : 'border-gray-200 dark:border-gray-800'}`}>
                    <div className="p-5 flex items-start gap-4">
                        <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${form.isSystemRole ? 'bg-violet-100 dark:bg-violet-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <Lock className={`w-5 h-5 ${form.isSystemRole ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">System role</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                        Bir marta belgilangach <strong>qaytarib bo'lmaydi</strong>. O'chirib, bulk-delete qilib bo'lmaydi.
                                    </p>
                                </div>
                                <button type="button" onClick={() => set('isSystemRole', !form.isSystemRole)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${form.isSystemRole ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: form.isSystemRole ? '22px' : '2px' }} />
                                </button>
                            </div>
                            {form.isSystemRole && (
                                <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                    <p className="text-[11px] text-amber-700 dark:text-amber-300">Bu rol doimiy himoyalangan bo'ladi.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button onClick={() => router.back()} className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        Bekor
                    </button>
                    <button onClick={handleSubmit} disabled={isCreating} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Role yaratish
                    </button>
                </div>
            </div>
        </div>
    );
}

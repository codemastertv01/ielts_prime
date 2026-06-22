'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Ban, Calendar, Check, ChevronRight, Eye, EyeOff, Loader2, Lock, RefreshCw } from 'lucide-react';
import { EntityStatus } from '@/types/entity.status';
import { useUser, useUserCooldowns } from '@/hooks/useAdminUsers';
import type { AdminResetPasswordDto, BlockUserDto, ChangeEmailDto, ChangePasswordDto, ChangePhoneDto, ChangeStatusDto, ChangeUsernameDto, ScheduleStatusDto, UpdateUserDto } from '@/types/user';
import { ALL_STATUSES, inputCls, labelCls, StatusBadge, UserAvatar } from '../../components/UserShared';

// ─── Tab type ─────────────────────────────────────────────────
type Tab = 'profile' | 'sensitive' | 'status' | 'block' | 'password' | 'schedule';

export default function EditUserPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id ?? '';

    const { user, isLoading, isRefetching, refetch, update, isUpdating, changeStatus, isChangingStatus, scheduleStatus, isScheduling, block, isBlocking, changeUsername, isChangingUsername, changeEmail, isChangingEmail, changePhone, isChangingPhone, changePassword, isChangingPassword, adminResetPassword, isResettingPassword } = useUser(id);

    const { data: cooldownsData } = useUserCooldowns(id);
    const cooldowns = cooldownsData ?? {};

    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [apiError, setApiError] = useState('');
    const [saveOk, setSaveOk] = useState('');

    // Profile form
    const [profile, setProfile] = useState({ firstName: '', lastName: '', bio: '', avatarUrl: '', isEmailVerified: false });

    // Status form
    const [statusForm, setStatusForm] = useState({ status: '' as EntityStatus, reason: '' });

    // Schedule form
    const [schedForm, setSchedForm] = useState({ status: '' as EntityStatus, scheduledAt: '', reason: '' });

    // Block form
    const [blockForm, setBlockForm] = useState({ isBlocked: false, blockReason: '', blockedUntil: '' });

    // Sensitive forms
    const [usernameForm, setUsernameForm] = useState({ newUsername: '', currentPassword: '' });
    const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
    const [phoneForm, setPhoneForm] = useState({ newPhone: '', currentPassword: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [resetForm, setResetForm] = useState({ newPassword: '', reason: '' });
    const [showPw, setShowPw] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (user && activeTab === 'profile') {
            setProfile({ firstName: user.firstName, lastName: user.lastName, bio: user.bio ?? '', avatarUrl: user.avatarUrl ?? '', isEmailVerified: user.isEmailVerified });
            setStatusForm((p) => ({ ...p, status: user.status }));
            setBlockForm((p) => ({ ...p, isBlocked: user.blockInfo?.isBlocked ?? false, blockReason: user.blockInfo?.blockReason ?? '' }));
        }
    }, [user]);

    const showOk = (msg: string) => {
        setSaveOk(msg);
        setTimeout(() => setSaveOk(''), 3000);
    };

    const mutate = (fn: () => void) => {
        setApiError('');
        fn();
    };

    const handleSaveProfile = () =>
        mutate(() => {
            const dto: UpdateUserDto = { firstName: profile.firstName.trim(), lastName: profile.lastName.trim(), bio: profile.bio.trim() || undefined, avatarUrl: profile.avatarUrl.trim() || undefined, isEmailVerified: profile.isEmailVerified };
            update(dto, { onSuccess: () => showOk('Profil saqlandi'), onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato') });
        });

    const handleSaveStatus = () =>
        mutate(() => {
            if (!statusForm.status || statusForm.status === user?.status) {
                setApiError('Status tanlang yoki u allaqachon shu qiymatda');
                return;
            }
            const dto: ChangeStatusDto = { status: statusForm.status, reason: statusForm.reason.trim() || undefined };
            changeStatus(dto, { onSuccess: () => showOk('Status yangilandi'), onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato') });
        });

    const handleSchedule = () =>
        mutate(() => {
            if (!schedForm.scheduledAt) {
                setApiError('Vaqt kiriting');
                return;
            }
            if (new Date(schedForm.scheduledAt) <= new Date()) {
                setApiError("O'tgan vaqt kiritildi");
                return;
            }
            const dto: ScheduleStatusDto = { status: schedForm.status, scheduledAt: new Date(schedForm.scheduledAt).toISOString(), reason: schedForm.reason || undefined };
            scheduleStatus(dto, { onSuccess: () => showOk('Rejalashtirildi'), onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato') });
        });

    const handleBlock = () =>
        mutate(() => {
            const dto: BlockUserDto = { isBlocked: blockForm.isBlocked, blockReason: blockForm.blockReason.trim() || undefined, blockedUntil: blockForm.blockedUntil || undefined };
            block(dto, { onSuccess: () => showOk(blockForm.isBlocked ? 'Bloklandi' : 'Blokdan chiqarildi'), onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato') });
        });

    const handleChangeUsername = () =>
        mutate(() => {
            if (!usernameForm.newUsername || !usernameForm.currentPassword) {
                setApiError('Barcha maydonlar majburiy');
                return;
            }
            const dto: ChangeUsernameDto = { newUsername: usernameForm.newUsername.trim(), currentPassword: usernameForm.currentPassword };
            changeUsername(dto, {
                onSuccess: () => {
                    showOk("Username o'zgartirildi");
                    setUsernameForm({ newUsername: '', currentPassword: '' });
                },
                onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato'),
            });
        });

    const handleChangeEmail = () =>
        mutate(() => {
            const dto: ChangeEmailDto = { newEmail: emailForm.newEmail.trim().toLowerCase(), currentPassword: emailForm.currentPassword };
            changeEmail(dto, {
                onSuccess: () => {
                    showOk("Email o'zgartirildi");
                    setEmailForm({ newEmail: '', currentPassword: '' });
                },
                onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato'),
            });
        });

    const handleChangePhone = () =>
        mutate(() => {
            const dto: ChangePhoneDto = { newPhone: phoneForm.newPhone.trim(), currentPassword: phoneForm.currentPassword };
            changePhone(dto, {
                onSuccess: () => {
                    showOk("Telefon o'zgartirildi");
                    setPhoneForm({ newPhone: '', currentPassword: '' });
                },
                onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato'),
            });
        });

    const handleChangePassword = () =>
        mutate(() => {
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setApiError('Parollar mos kelmadi');
                return;
            }
            const dto: ChangePasswordDto = { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword, confirmPassword: passwordForm.confirmPassword };
            changePassword(dto, {
                onSuccess: () => {
                    showOk("Parol o'zgartirildi");
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                },
                onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato'),
            });
        });

    const handleAdminReset = () =>
        mutate(() => {
            const dto: AdminResetPasswordDto = { newPassword: resetForm.newPassword, reason: resetForm.reason || undefined };
            adminResetPassword(dto, {
                onSuccess: () => {
                    showOk('Parol admin tomonidan yangilandi');
                    setResetForm({ newPassword: '', reason: '' });
                },
                onError: (e: unknown) => setApiError((e as any)?.response?.data?.message ?? 'Xato'),
            });
        });

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

    const PwInput = ({ id: fid, value, onChange, placeholder }: any) => (
        <div className="relative">
            <input type={showPw[fid] ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} className={inputCls()} />
            <button type="button" onClick={() => setShowPw((p) => ({ ...p, [fid]: !p[fid] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw[fid] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );

    const CooldownInfo = ({ field }: { field: string }) => {
        const info = cooldowns[field];
        if (!info) return null;
        return info.canChange ? (
            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> O'zgartirish mumkin
            </p>
        ) : (
            <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> {new Date(info.nextAllowedAt!).toLocaleDateString('uz-UZ')} gacha o'zgartirish mumkin emas (14 kun cheklov)
            </p>
        );
    };

    const tabs: Array<{ id: Tab; label: string }> = [
        { id: 'profile', label: 'Profil' },
        { id: 'sensitive', label: 'Maxfiy' },
        { id: 'password', label: 'Parol' },
        { id: 'status', label: 'Status' },
        { id: 'block', label: 'Block' },
        { id: 'schedule', label: 'Rejalashtirish' },
    ];

    if (isLoading)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                </div>
            </div>
        );

    if (!user)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-3">Foydalanuvchi topilmadi</p>
                    <button onClick={() => router.back()} className="text-sm text-indigo-600 hover:underline">
                        ← Orqaga
                    </button>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
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
                                <span className="font-mono">{user._id.slice(-8).toUpperCase()}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Tahrirlash</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                                <UserAvatar firstName={user.firstName} lastName={user.lastName} avatarUrl={user.avatarUrl} size="sm" />
                                {user.firstName} {user.lastName}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={user.status} />
                        {user.blockInfo?.isBlocked && <Ban className="w-4 h-4 text-red-500" />}
                        <button onClick={() => refetch()} disabled={isRefetching} className="p-2 rounded-xl text-gray-400 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 transition disabled:opacity-50">
                            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Alerts */}
                <AnimatePresence>
                    {apiError && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-300">{apiError}</p>
                        </motion.div>
                    )}
                    {saveOk && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">{saveOk}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl overflow-x-auto">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setActiveTab(t.id);
                                setApiError('');
                            }}
                            className={`flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-xl transition ${activeTab === t.id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Profile tab ─── */}
                {activeTab === 'profile' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Profil maydonlari</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <F label="Ism">
                                    <input value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} placeholder="John" className={inputCls()} />
                                </F>
                                <F label="Familiya">
                                    <input value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} placeholder="Doe" className={inputCls()} />
                                </F>
                            </div>
                            <F label="Bio">
                                <textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Bio..." className={`${inputCls()} resize-none`} />
                            </F>
                            <F label="Avatar URL">
                                <input value={profile.avatarUrl} onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))} placeholder="https://..." className={inputCls()} />
                            </F>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Email tasdiqlangan</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Admin tomonidan belgilash</p>
                                </div>
                                <button type="button" onClick={() => setProfile((p) => ({ ...p, isEmailVerified: !p.isEmailVerified }))} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${profile.isEmailVerified ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: profile.isEmailVerified ? '22px' : '2px' }} />
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
                            <button onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition">
                                Bekor
                            </button>
                            <button onClick={handleSaveProfile} disabled={isUpdating} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Saqlash
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── Sensitive tab ─── */}
                {activeTab === 'sensitive' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {/* Username change */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Username o'zgartirish</h2>
                                <span className="text-xs font-mono text-gray-500">Joriy: {user.username}</span>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <p className="text-xs text-amber-700 dark:text-amber-300">14 kunlik cheklov mavjud. Joriy parol talab etiladi.</p>
                                </div>
                                <F label="Yangi username">
                                    <input value={usernameForm.newUsername} onChange={(e) => setUsernameForm((p) => ({ ...p, newUsername: e.target.value.toLowerCase() }))} placeholder="new_username" className={`${inputCls()} font-mono`} />
                                </F>
                                <CooldownInfo field="username" />
                                <F label="Joriy parol">
                                    <PwInput id="upw" value={usernameForm.currentPassword} onChange={(e: any) => setUsernameForm((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="Joriy parolingiz" />
                                </F>
                                <div className="flex justify-end">
                                    <button onClick={handleChangeUsername} disabled={isChangingUsername || !cooldowns.username?.canChange} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-50">
                                        {isChangingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        O'zgartirish
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Email change */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Email o'zgartirish</h2>
                                <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <p className="text-xs text-amber-700 dark:text-amber-300">Email o'zgargach email tasdiqlash qayta talab etiladi.</p>
                                </div>
                                <F label="Yangi email">
                                    <input type="email" value={emailForm.newEmail} onChange={(e) => setEmailForm((p) => ({ ...p, newEmail: e.target.value }))} placeholder="new@example.com" className={inputCls()} />
                                </F>
                                <CooldownInfo field="email" />
                                <F label="Joriy parol">
                                    <PwInput id="epw" value={emailForm.currentPassword} onChange={(e: any) => setEmailForm((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="Joriy parolingiz" />
                                </F>
                                <div className="flex justify-end">
                                    <button onClick={handleChangeEmail} disabled={isChangingEmail || !cooldowns.email?.canChange} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-50">
                                        {isChangingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        O'zgartirish
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Phone change */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Telefon o'zgartirish</h2>
                                <span className="text-xs text-gray-500">{user.phone ?? '—'}</span>
                            </div>
                            <div className="p-6 space-y-4">
                                <F label="Yangi telefon" hint="+998901234567">
                                    <input value={phoneForm.newPhone} onChange={(e) => setPhoneForm((p) => ({ ...p, newPhone: e.target.value }))} placeholder="+998901234567" className={inputCls()} />
                                </F>
                                <CooldownInfo field="phone" />
                                <F label="Joriy parol">
                                    <PwInput id="ppw" value={phoneForm.currentPassword} onChange={(e: any) => setPhoneForm((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="Joriy parolingiz" />
                                </F>
                                <div className="flex justify-end">
                                    <button onClick={handleChangePhone} disabled={isChangingPhone || !cooldowns.phone?.canChange} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-50">
                                        {isChangingPhone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        O'zgartirish
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Password tab ─── */}
                {activeTab === 'password' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {/* User change password */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Parol o'zgartirish (foydalanuvchi)</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <CooldownInfo field="password" />
                                <F label="Joriy parol">
                                    <PwInput id="cpw" value={passwordForm.currentPassword} onChange={(e: any) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="Joriy parol" />
                                </F>
                                <F label="Yangi parol">
                                    <PwInput id="npw" value={passwordForm.newPassword} onChange={(e: any) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Yangi parol (min 8 belgi)" />
                                </F>
                                <F label="Tasdiqlash">
                                    <PwInput id="cfpw" value={passwordForm.confirmPassword} onChange={(e: any) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Parolni tasdiqlash" />
                                </F>
                                <div className="flex justify-end">
                                    <button onClick={handleChangePassword} disabled={isChangingPassword || !cooldowns.password?.canChange} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50">
                                        {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Parolni o'zgartirish
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Admin reset */}
                        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-red-100 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                                <h2 className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-widest">Admin parol tiklash</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                    <p className="text-xs text-red-700 dark:text-red-300">Admin: joriy parol talab etilmaydi. users:manage ruxsati kerak.</p>
                                </div>
                                <F label="Yangi parol">
                                    <PwInput id="rpw" value={resetForm.newPassword} onChange={(e: any) => setResetForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Yangi parol" />
                                </F>
                                <F label="Sabab (ixtiyoriy)">
                                    <input value={resetForm.reason} onChange={(e) => setResetForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Nima uchun?" className={inputCls()} />
                                </F>
                                <div className="flex justify-end">
                                    <button onClick={handleAdminReset} disabled={isResettingPassword} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50">
                                        {isResettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                        Admin reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Status tab ─── */}
                {activeTab === 'status' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status boshqaruvi</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-gray-500">Joriy:</span>
                                <StatusBadge status={user.status} />
                            </div>
                            <div>
                                <label className={labelCls}>Yangi status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ALL_STATUSES.filter((s) => ['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED'].includes(s)).map((s) => (
                                        <button key={s} type="button" onClick={() => setStatusForm((p) => ({ ...p, status: s }))} disabled={s === user.status} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${statusForm.status === s && s !== user.status ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'}`}>
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s === 'ACTIVE' ? 'bg-emerald-500' : s === 'INACTIVE' ? 'bg-red-500' : s === 'PENDING' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                                            {s}
                                            {s === user.status && <span className="ml-auto text-[10px] text-gray-400">joriy</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <F label="Sabab (ixtiyoriy)">
                                <textarea value={statusForm.reason} onChange={(e) => setStatusForm((p) => ({ ...p, reason: e.target.value }))} rows={2} placeholder="Nima uchun?" className={`${inputCls()} resize-none`} />
                            </F>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end">
                            <button onClick={handleSaveStatus} disabled={isChangingStatus || statusForm.status === user.status || !statusForm.status} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                                {isChangingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Status yangilash
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── Block tab ─── */}
                {activeTab === 'block' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Block boshqaruvi</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-gray-500">Joriy holat:</span>
                                {user.blockInfo?.isBlocked ? (
                                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <Ban className="w-3 h-3" /> Bloklangan
                                    </span>
                                ) : (
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Faol
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Block holati</p>
                                    <p className="text-xs text-gray-500 mt-0.5">User tizimga kira olmaydi</p>
                                </div>
                                <button type="button" onClick={() => setBlockForm((p) => ({ ...p, isBlocked: !p.isBlocked }))} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${blockForm.isBlocked ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: blockForm.isBlocked ? '22px' : '2px' }} />
                                </button>
                            </div>
                            {blockForm.isBlocked && (
                                <>
                                    <F label="Block sababi">
                                        <textarea value={blockForm.blockReason} onChange={(e) => setBlockForm((p) => ({ ...p, blockReason: e.target.value }))} rows={2} placeholder="Nima uchun bloklanmoqda?" className={`${inputCls()} resize-none`} />
                                    </F>
                                    <F label="Bloklash muddati (ixtiyoriy)" hint="Bo'sh qoldirilsa muddatsiz">
                                        <input type="datetime-local" value={blockForm.blockedUntil} onChange={(e) => setBlockForm((p) => ({ ...p, blockedUntil: e.target.value }))} min={new Date().toISOString().slice(0, 16)} className={inputCls()} />
                                    </F>
                                </>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end">
                            <button onClick={handleBlock} disabled={isBlocking} className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 shadow-sm ${blockForm.isBlocked ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                {isBlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                {blockForm.isBlocked ? 'Bloklash' : 'Blokdan chiqarish'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── Schedule tab ─── */}
                {activeTab === 'schedule' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status rejalashtirish</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                                <p className="text-xs text-indigo-700 dark:text-indigo-300">Kelajakdagi muayyan vaqtda status avtomatik o'zgartiriladi.</p>
                            </div>
                            <div>
                                <label className={labelCls}>Rejalashtiriladigan status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['ACTIVE', 'INACTIVE', 'ARCHIVED'] as EntityStatus[]).map((s) => (
                                        <button key={s} type="button" onClick={() => setSchedForm((p) => ({ ...p, status: s }))} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition ${schedForm.status === s ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'}`}>
                                            <span className={`w-2 h-2 rounded-full ${s === 'ACTIVE' ? 'bg-emerald-500' : s === 'INACTIVE' ? 'bg-red-500' : 'bg-gray-400'}`} />
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <F label="Vaqt">
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="datetime-local" value={schedForm.scheduledAt} onChange={(e) => setSchedForm((p) => ({ ...p, scheduledAt: e.target.value }))} min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} className={`${inputCls()} pl-9`} />
                                </div>
                            </F>
                            <F label="Sabab (ixtiyoriy)">
                                <input value={schedForm.reason} onChange={(e) => setSchedForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Ixtiyoriy..." className={inputCls()} />
                            </F>
                            {user.statusSchedules && user.statusSchedules.length > 0 && (
                                <div>
                                    <label className={labelCls}>Mavjud rejalar</label>
                                    <div className="space-y-2">
                                        {user.statusSchedules.map((s, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                                                <StatusBadge status={s.scheduledStatus} />
                                                <span className="text-gray-400">→</span>
                                                <span className="text-gray-600 dark:text-gray-400">{new Date(s.scheduledAt).toLocaleString('uz-UZ')}</span>
                                                <span className="text-gray-400 ml-auto">by {s.setBy?.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end">
                            <button onClick={handleSchedule} disabled={isScheduling || !schedForm.scheduledAt || !schedForm.status} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50 shadow-sm">
                                {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                Rejalashtirish
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

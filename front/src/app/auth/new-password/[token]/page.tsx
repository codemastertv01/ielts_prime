'use client'
import Link from 'next/link'
import { memo, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { Lock, CheckCircle, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import AuthLayout from '@/components/Layout/AuthLayout'
import Input from '@/components/UI/Input'
import Button from '@/components/UI/Button'
import FadeIn from '@/components/animations/FadeIn'
import SlideUp from '@/components/animations/SlideUp'
import { useAuth } from '@/hooks/useAuth'
import { useParams } from 'next/navigation'

// ─── Password requirements ────────────────────────────────────────────────────
const REQS = [
    { re: /.{8,}/, text: 'Kamida 8 ta belgi' },
    { re: /[A-Z]/, text: 'Katta harf (A–Z)' },
    { re: /[a-z]/, text: 'Kichik harf (a–z)' },
    { re: /\d/, text: 'Raqam (0–9)' },
    { re: /[@$!%*?&_#]/, text: 'Maxsus belgi' },
]

const Requirements = ({ pwd }: { pwd: string }) => (
    <div className="rounded-xl p-3.5 bg-primary-50 dark:bg-primary-500/10 ring-1 ring-primary-200 dark:ring-primary-500/20 space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300 mb-2">
            Parol talablari
        </p>
        {REQS.map(r => {
            const ok = r.re.test(pwd)
            return (
                <p key={r.text} className={`text-xs flex items-center gap-2 transition-colors ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-dark-400 dark:text-dark-500'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center transition-all ${ok ? 'border-emerald-500 bg-emerald-500' : 'border-dark-300 dark:border-dark-600'}`}>
                        {ok && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 8 8">
                            <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>}
                    </span>
                    {r.text}
                </p>
            )
        })}
    </div>
)

// ─── Success ──────────────────────────────────────────────────────────────────
const SuccessScreen = () => (
    <motion.div className="text-center py-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }} className="inline-flex p-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-5 shadow-xl shadow-emerald-400/30">
            <ShieldCheck className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-3">Parol yangilandi!</h2>
        <p className="text-sm text-dark-500 dark:text-dark-400 mb-7 leading-relaxed">
            Parolingiz muvaffaqiyatli yangilandi. Endi yangi parol bilan kirishingiz mumkin.
        </p>
        <Link href="/auth/login">
            <Button fullWidth Icon={CheckCircle}>Kirish sahifasiga o'tish</Button>
        </Link>
    </motion.div>
)

// ─── Component ────────────────────────────────────────────────────────────────
const ResetPassword = () => {
    const params = useParams<{ token: string }>()
    const token = params?.token ?? ''
    const { resetPassword, isResetLoading } = useAuth()
    const [success, setSuccess] = useState(false)
    const [showPwd, setShowPwd] = useState(false)

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        mode: 'onBlur',
        defaultValues: { password: '', confirmPassword: '' },
    })

    const pwd = watch('password')

    const onSubmit = useCallback(async (data: { password: string; confirmPassword: string }) => {
        if (!token) return
        await resetPassword({ token, password: data.password })
        setSuccess(true)
    }, [token, resetPassword])

    return (
        <AuthLayout title="Yangi parol" subtitle="Hisobingiz uchun yangi parol yarating">
            <AnimatePresence mode="wait">
                {success ? (
                    <SuccessScreen key="success" />
                ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SlideUp>
                            <div className="text-center mb-7">
                                <motion.div animate={{ rotate: [0, 8, 0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }} className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 mb-4 shadow-lg shadow-primary-500/20">
                                    <Lock className="w-8 h-8 text-white" />
                                </motion.div>
                                <p className="text-sm text-dark-500 dark:text-dark-400">
                                    Yangi, kuchli parol yarating
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                                {/* New password */}
                                <FadeIn>
                                    <Controller name="password" control={control}
                                        rules={{
                                            required: 'Parol majburiy',
                                            validate: v => REQS.slice(0, 4).every(r => r.re.test(v)) || 'Parol barcha talablarga javob bermaydi',
                                        }}
                                        render={({ field }) => (
                                            <div>
                                                <div className="relative">
                                                    <Input {...field} label="Yangi parol" type={showPwd ? 'text' : 'password'} placeholder="Yangi parol kiriting" Icon={Lock} error={errors.password?.message} autoComplete="new-password" required />
                                                    <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-9 text-dark-400 hover:text-dark-600 dark:text-dark-500 dark:hover:text-dark-300 transition-colors">
                                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {pwd && <div className="mt-2"><Requirements pwd={pwd} /></div>}
                                            </div>
                                        )}
                                    />
                                </FadeIn>

                                {/* Confirm */}
                                <FadeIn delay={0.08}>
                                    <Controller name="confirmPassword" control={control}
                                        rules={{
                                            required: 'Parolni tasdiqlang',
                                            validate: v => v === pwd || 'Parollar mos emas',
                                        }}
                                        render={({ field }) => (
                                            <Input {...field} label="Parolni tasdiqlang" type={showPwd ? 'text' : 'password'} placeholder="Parolni qaytaring" Icon={Lock} error={errors.confirmPassword?.message} autoComplete="new-password" required />
                                        )}
                                    />
                                </FadeIn>

                                <FadeIn delay={0.15}>
                                    <Button type="submit" loading={isResetLoading} disabled={isResetLoading || !token} Icon={CheckCircle} fullWidth size="md">
                                        {isResetLoading ? 'Saqlanmoqda...' : 'Parolni saqlash'}
                                    </Button>
                                </FadeIn>

                                {!token && (
                                    <p className="text-xs text-center text-red-500 dark:text-red-400">
                                        Havola noto'g'ri yoki muddati o'tgan.{' '}
                                        <Link href="/auth/forgot-password" className="underline">Qayta so'rang</Link>
                                    </p>
                                )}
                            </form>
                        </SlideUp>
                    </motion.div>
                )}
            </AnimatePresence>

            <SlideUp delay={0.3}>
                <div className="text-center mt-6">
                    <Link href="/auth/login"
                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Loginga qaytish
                    </Link>
                </div>
            </SlideUp>
        </AuthLayout>
    )
}

export default memo(ResetPassword)
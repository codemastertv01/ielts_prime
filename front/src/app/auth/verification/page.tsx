'use client'
import {
    useState, useEffect, useRef, memo, useCallback,
    KeyboardEvent, ClipboardEvent, Suspense,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle, XCircle, RefreshCw, Clock, Lock, ArrowLeft } from 'lucide-react'
import AuthLayout from '@/components/Layout/AuthLayout'
import Button from '@/components/UI/Button'
import SlideUp from '@/components/animations/SlideUp'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

// ─── Success ──────────────────────────────────────────────────────────────────
const SuccessScreen = memo(({ onContinue }: { onContinue: () => void }) => (
    <motion.div className="text-center py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="inline-flex p-5 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 mb-6 shadow-xl shadow-emerald-400/30"
        >
            <CheckCircle className="w-14 h-14 text-white" />
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-dark-900 dark:text-white mb-3">
            Tasdiqlandi! 🎉
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-dark-500 dark:text-dark-400 mb-8 leading-relaxed max-w-sm mx-auto text-sm">
            Elektron pochtangiz muvaffaqiyatli tasdiqlandi. Hisobingiz endi faol.
        </motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <Button size="md" fullWidth Icon={CheckCircle} onClick={onContinue}>
                Davom etish →
            </Button>
        </motion.div>
    </motion.div>
))
SuccessScreen.displayName = 'SuccessScreen'

// ─── OTP box ──────────────────────────────────────────────────────────────────
const OtpBox = memo(({
    value, index, hasError, isFocused,
    inputRef, onChange, onKeyDown, onPaste, onFocus, onBlur,
}: {
    value: string; index: number; hasError: boolean; isFocused: boolean
    inputRef: (el: HTMLInputElement | null) => void
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
    onPaste: (e: ClipboardEvent<HTMLInputElement>) => void
    onFocus: () => void
    onBlur: () => void
}) => (
    <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
    >
        <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onFocus={onFocus}
            onBlur={onBlur}
            autoComplete="one-time-code"
            className={`
                w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl
                border-2 outline-none transition-all duration-200
                bg-white dark:bg-dark-800
                text-dark-900 dark:text-white
                caret-primary-500 select-none
                ${hasError ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-500/10' : isFocused ? 'border-primary-500 dark:border-primary-400 shadow-lg shadow-primary-500/20 bg-primary-50/40 dark:bg-primary-500/5 scale-105' : value ? 'border-primary-300 dark:border-primary-600 bg-primary-50/20 dark:bg-primary-500/5' : 'border-dark-200 dark:border-dark-700 hover:border-dark-300 dark:hover:border-dark-600'}
            `}
        />
        {value && !hasError && (
            <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400"
            />
        )}
    </motion.div>
))
OtpBox.displayName = 'OtpBox'

// ─── Inner component (needs useSearchParams — must be inside Suspense) ────────
const VerificationInner = () => {
    const router = useRouter()
    const params = useSearchParams()
    const email = params?.get('email') ?? ''

    const { sendVerificationCode, confirmVerificationCode, isVerifyLoading } = useAuth()

    const [code, setCode] = useState<string[]>(Array(6).fill(''))
    const [countdown, setCountdown] = useState(180)
    const [error, setError] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [focusIdx, setFocusIdx] = useState<number | null>(null)

    const refs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

    // Timer
    useEffect(() => {
        if (countdown <= 0 || isSuccess) return
        const t = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [countdown, isSuccess])

    // Birinchi inputga focus
    useEffect(() => { refs.current[0]?.focus() }, [])

    // ── verify ────────────────────────────────────────────────────────────────
    const verify = useCallback(async (arr: string[]) => {
        const val = arr.join('')
        if (val.length !== 6) { setError('6 ta raqam kiriting'); return }
        if (!email) { setError('Email topilmadi. URL ni tekshiring'); return }
        if (countdown <= 0) { setError('Kod muddati tugadi. Qayta yuboring'); return }

        try {
            await confirmVerificationCode({ email, code: val })
            setIsSuccess(true)
        } catch {
            setError('Kod noto\'g\'ri yoki muddati o\'tgan')
            setCode(Array(6).fill(''))
            setTimeout(() => refs.current[0]?.focus(), 50)
        }
    }, [email, countdown, confirmVerificationCode])

    // ── onChange ──────────────────────────────────────────────────────────────
    const handleChange = useCallback((idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const digit = e.target.value.replace(/\D/g, '').slice(-1)
        setError('')
        setCode(prev => {
            const next = [...prev]
            next[idx] = digit
            if (digit && idx === 5 && next.every(d => d !== '')) {
                setTimeout(() => verify(next), 0)
            }
            return next
        })
        if (digit && idx < 5) setTimeout(() => refs.current[idx + 1]?.focus(), 0)
    }, [verify])

    // ── onKeyDown ─────────────────────────────────────────────────────────────
    const handleKeyDown = useCallback((idx: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            setError('')
            if (code[idx]) {
                setCode(p => { const n = [...p]; n[idx] = ''; return n })
            } else if (idx > 0) {
                setCode(p => { const n = [...p]; n[idx - 1] = ''; return n })
                setTimeout(() => refs.current[idx - 1]?.focus(), 0)
            }
        } else if (e.key === 'ArrowLeft' && idx > 0) refs.current[idx - 1]?.focus()
        else if (e.key === 'ArrowRight' && idx < 5) refs.current[idx + 1]?.focus()
    }, [code])

    // ── onPaste ───────────────────────────────────────────────────────────────
    const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
        if (!digits.length) return
        const next = Array(6).fill('')
        digits.forEach((d, i) => { next[i] = d })
        setCode(next)
        setError('')
        const last = Math.min(digits.length, 5)
        setTimeout(() => refs.current[last]?.focus(), 0)
        if (digits.length === 6) setTimeout(() => verify(next), 50)
    }, [verify])

    // ── resend ────────────────────────────────────────────────────────────────
    const handleResend = useCallback(async () => {
        if (!email) { setError('Email topilmadi'); return }
        await sendVerificationCode(email)
        setCountdown(180)
        setCode(Array(6).fill(''))
        setError('')
        setTimeout(() => refs.current[0]?.focus(), 50)
    }, [email, sendVerificationCode])

    // ─────────────────────────────────────────────────────────────────────────
    if (isSuccess) {
        return (
            <AuthLayout title="" subtitle="">
                <SuccessScreen onContinue={() => router.push('/dashboard')} />
            </AuthLayout>
        )
    }

    const canSubmit = code.every(d => d !== '') && !isVerifyLoading && countdown > 0

    return (
        <AuthLayout title="" subtitle="">
            <SlideUp>
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div animate={{ rotate: [0, 8, 0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-pink-500 mb-5 shadow-lg shadow-primary-500/25">
                        <Mail className="w-10 h-10 text-white" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
                        Email Tasdiqlash
                    </h2>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
                        <span className="font-semibold text-dark-800 dark:text-dark-200">
                            {email || 'elektron pochtangiz'}
                        </span>
                        {' '}ga yuborilgan 6 ta raqamni kiriting
                    </p>

                    {/* Timer pill */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-50 dark:bg-dark-800 ring-1 ring-dark-200 dark:ring-dark-700">
                        <Clock className={`w-4 h-4 ${countdown < 30 ? 'text-red-500' : 'text-primary-500 dark:text-primary-400'}`} />
                        <span className={`font-mono text-base font-bold tabular-nums ${countdown < 30 ? 'text-red-500 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'}`}>
                            {fmt(countdown)}
                        </span>
                        <span className="text-xs text-dark-400 dark:text-dark-500">qoldi</span>
                    </div>
                </div>

                {/* OTP */}
                <div className="mb-6">
                    <div className="flex justify-center items-center gap-2 sm:gap-3 mb-5">
                        {code.map((digit, i) => (
                            <OtpBox key={i} index={i} value={digit} hasError={!!error} isFocused={focusIdx === i} inputRef={el => { refs.current[i] = el }} onChange={e => handleChange(i, e)} onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste} onFocus={() => setFocusIdx(i)} onBlur={() => setFocusIdx(null)} />
                        ))}
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm mb-2">
                                <XCircle className="w-4 h-4 shrink-0" /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Resend */}
                    <div className="flex justify-center mt-3">
                        <button onClick={handleResend} disabled={isVerifyLoading || countdown > 0} className={`flex items-center gap-2 text-sm font-medium transition-all ${isVerifyLoading || countdown > 0 ? 'text-dark-300 dark:text-dark-600 cursor-not-allowed' : 'text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300'}`}>
                            <RefreshCw className={`w-4 h-4 ${isVerifyLoading ? 'animate-spin' : ''}`} />
                            {countdown > 0 ? `Qayta yuborish — ${fmt(countdown)}` : 'Kodni qayta yuborish'}
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <Button size="md" fullWidth Icon={Lock} loading={isVerifyLoading}
                    onClick={() => verify(code)} disabled={!canSubmit}>
                    {isVerifyLoading ? 'Tekshirilmoqda...' : 'Tasdiqlash va davom etish'}
                </Button>
            </SlideUp>

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

// ─── Wrapper with Suspense (Next.js useSearchParams requirement) ──────────────
const Verification = () => (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    }>
        <VerificationInner />
    </Suspense>
)

export default memo(Verification)
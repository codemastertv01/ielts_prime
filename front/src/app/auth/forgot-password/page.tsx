'use client';
import Link from 'next/link';
import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import FadeIn from '@/components/animations/FadeIn';
import SlideUp from '@/components/animations/SlideUp';
import AuthLayout from '@/components/Layout/AuthLayout';
import { useAuth } from '@/hooks/useAuth';

const SuccessMessage = memo(({ email, onBack }: { email: string; onBack: () => void }) => (
    <div className="text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="inline-block p-4 rounded-full bg-linear-to-r from-green-500 to-emerald-500 mb-6">
            <Send className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Check Your Email!</h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
            We&apos;ve sent password reset instructions to <strong>{email}</strong>. Please check
            your inbox and follow the link to reset your password.
        </p>

        <div className="space-y-4">
            <Button onClick={onBack} variant="secondary" fullWidth>
                Try Another Email
            </Button>
        </div>
    </div>
));

SuccessMessage.displayName = 'SuccessMessage';

const ForgotPassword = () => {
    const { forgotPassword } = useAuth();
    const [sent, setSent] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({ mode: 'onBlur', defaultValues: { email: '' } });

    const onSubmit = useCallback(
        async (data: { email: string }) => {
            await forgotPassword(data.email);
            setSubmittedEmail(data.email);
            setSent(true);
        },
        [forgotPassword]
    );

    const handleBack = useCallback(() => {
        setSent(false);
        reset();
    }, [reset]);

    return (
        <AuthLayout title="Forgot Password" subtitle="Enter your email to receive reset instructions">
            <SlideUp>
                {!sent ? (
                    <>
                        <div className="text-center mb-8">
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block p-4 rounded-full bg-linear-to-r from-orange-500 to-red-500 mb-4">
                                <Mail className="w-8 h-8 text-white" />
                            </motion.div>

                            <p className="text-gray-600 dark:text-gray-400">
                                Don&apos;t worry! Just enter your email and we&apos;ll send you a
                                reset link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                            <FadeIn>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <Input {...field} label="Email Address" type="email" error={errors.email?.message} placeholder="you@example.com" Icon={Mail} autoComplete="email" required />
                                    )}
                                />
                            </FadeIn>

                            <FadeIn delay={0.1}>
                                <Button type="submit" loading={isSubmitting} disabled={isSubmitting} Icon={Send} fullWidth size="md">
                                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </FadeIn>
                        </form>
                    </>
                ) : (
                    <SuccessMessage email={submittedEmail} onBack={handleBack} />
                )}
            </SlideUp>

            <SlideUp delay={0.3}>
                <div className="text-center mt-6">
                    <Link href="/auth/login" className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Sign In
                    </Link>
                </div>
            </SlideUp>
        </AuthLayout>
    );
};

export default memo(ForgotPassword);

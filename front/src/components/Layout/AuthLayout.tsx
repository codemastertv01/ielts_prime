'use client'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ToggleTheme from '../UI/ToggleTheme'
import FadeIn from '../animations/FadeIn'
import Card from '../UI/Card'

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
    subtitle: string
}

type Particle = {
    left: number
    top: number
    duration: number
    delay: number
}

const DOT_COUNT = 20

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
    const [particles, setParticles] = useState<Particle[]>([])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setParticles(
            Array.from({ length: DOT_COUNT }, () => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
            }))
        )
        setMounted(true)
    }, [])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-br from-gray-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900/10">

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* FIX: mounted bo'lmasa render qilinmaydi — SSR da bo'sh */}
                {mounted && particles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary-500/20 rounded-full"
                        style={{ left: `${p.left}%`, top: `${p.top}%` }}
                        animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
                    />
                ))}
            </div>

            <div className="fixed top-0 right-0 z-50 p-6">
                <ToggleTheme />
            </div>

            <Card glow className="w-full max-w-md z-10">
                <FadeIn>
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            {title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {subtitle}
                        </p>
                    </div>
                </FadeIn>

                {children}

                <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                    <p>© 2024 SecureAuth. All rights reserved. |{' '}
                        <Link href="/privacy" className="hover:text-primary-500 transition-colors">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    )
}

export default AuthLayout

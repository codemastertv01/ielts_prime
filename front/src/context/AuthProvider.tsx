'use client'

import { createContext, useContext, useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { SessionManager } from '@/utils/sessionManager'
import { auditLogger } from '@/utils/auditLog'
import { showToast } from '@/services/toastService'

interface AuthContextType {
    isAuthenticated: boolean
    isAuthPage: boolean
    isPublicPage: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const AUTH_PATHS = [
    '/auth/login',
    '/auth/register',
    '/auth/verification',
    '/auth/forgot-password',
    '/auth/reset-password',
]

const PUBLIC_PATHS = [
    '/terms',
    '/privacy',
    '/about',
    '/contact',
    '/help',
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    const { isAuthenticated,  token, clearAuth, } = useAuthStore()

    const sessionManager = useMemo(() => new SessionManager({
        warningTime: 2 * 60 * 1000,
        onWarning: () => {
            showToast.custom(
                'Your session will expire in 2 minutes. Please save your work.',
                { duration: 10000, icon: '⚠️' }
            )
            auditLogger.log('SESSION_WARNING', { remainingTime: 120 })
        },
        onExpiry: () => handleSessionExpiry(),
    }), [])

    const handleSessionExpiry = () => {
        auditLogger.log('SESSION_EXPIRED', {
            path: pathname,
            timestamp: new Date().toISOString(),
        })

        clearAuth()
        showToast.error('Your session has expired. Please login again.')
        router.replace('/auth/login')
    }

    const isAuthPage = useMemo(() => AUTH_PATHS.some((path) => (pathname as string).startsWith(path)), [pathname])

    const isPublicPage = useMemo(() => PUBLIC_PATHS.some((path) => (pathname as string).startsWith(path)), [pathname])

    useEffect(() => {
        const hasToken = !!token

        if (!hasToken) {
            if (isAuthenticated) clearAuth()

            if (!isAuthPage && !isPublicPage) {
                auditLogger.log('UNAUTHORIZED_ACCESS_ATTEMPT', { path: pathname })
                router.replace('/auth/login')
            }
            return
        }

        if (isAuthPage) {
            router.replace('/dashboard')
        }

        return () => sessionManager.stop()
    }, [
        token,
        isAuthenticated,
        isAuthPage,
        isPublicPage,
        pathname,
        router,
        clearAuth,
        sessionManager,
    ])

    const contextValue = useMemo<AuthContextType>(() => ({
        isAuthenticated,
        isAuthPage,
        isPublicPage,
    }), [isAuthenticated, isAuthPage, isPublicPage])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthContext must be used inside AuthProvider')
    }
    return context
}

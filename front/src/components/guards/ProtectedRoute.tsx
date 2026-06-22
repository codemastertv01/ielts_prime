import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { auditLogger } from '@/utils/auditLog'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation()
    const { isAuthenticated, token } = useAuthStore()

    const hasValidSession = isAuthenticated && token

    if (!hasValidSession) {
        auditLogger.log('PROTECTED_ROUTE_BLOCKED', {
            path: location.pathname,
            reason: !token ? 'no_token' : !isAuthenticated ? 'not_authenticated' : 'session_expired',
        })

        return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    }

    return children
}

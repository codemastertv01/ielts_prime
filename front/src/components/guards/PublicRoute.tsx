import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation()
    const { isAuthenticated,  token } = useAuthStore()

    const hasValidSession = isAuthenticated && token

    if (hasValidSession) {
        const from = location.state?.from || '/dashboard'
        return <Navigate to={from} replace />
    }

    return children
}

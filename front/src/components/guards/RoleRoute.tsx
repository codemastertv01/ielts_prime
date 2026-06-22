import { Navigate, useLocation } from 'react-router-dom';
import { showToast } from '@/services/toastService';
import { useAuthStore } from '@/stores/authStore';
import { auditLogger } from '@/utils/auditLog';

interface RoleRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export const RoleRoute = ({ children, allowedRoles = [] }: RoleRouteProps) => {
    const location = useLocation();
    const { isAuthenticated, token, user } = useAuthStore();

    const hasValidSession = isAuthenticated && token

    if (!hasValidSession) {
        return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
    }

    const userRole = user?.role || 'user';
    const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(userRole);

    if (!hasPermission) {
        auditLogger.log('ROLE_ACCESS_DENIED', {
            path: location.pathname,
            userRole,
            requiredRoles: allowedRoles,
        });

        showToast.error('You do not have permission to access this page.');
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

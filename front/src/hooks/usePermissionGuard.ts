// // permissions/hooks/usePermissionGuard.ts
// 'use client';
// import { useCallback, useMemo } from 'react';
// import { useAuthStore } from '@/stores/authStore';
// import type { RoutePermission } from '../types/permission';

// // ─── Route → required permissions map ────────────────────────
// // Add every protected route here.
// // requireAll: true  → user must have ALL listed permissions
// // requireAll: false → user must have AT LEAST ONE (default)

// export const ROUTE_PERMISSIONS: RoutePermission[] = [
//     // ── Dashboard ──────────────────────────────────────────────
//     { path: '/admin', requiredPermissions: ['admin:read', 'admin:manage'] },

//     // ── Users ──────────────────────────────────────────────────
//     { path: '/admin/users', requiredPermissions: ['users:read'] },
//     { path: '/admin/users/create', requiredPermissions: ['users:create'] },
//     { path: '/admin/users/:id/edit', requiredPermissions: ['users:update'] },
//     { path: '/admin/users/:id', requiredPermissions: ['users:read'] },

//     // ── Roles ──────────────────────────────────────────────────
//     { path: '/admin/roles', requiredPermissions: ['roles:read'] },
//     { path: '/admin/roles/create', requiredPermissions: ['roles:create'] },
//     { path: '/admin/roles/:id/edit', requiredPermissions: ['roles:update'] },

//     // ── Permissions ────────────────────────────────────────────
//     { path: '/admin/permissions', requiredPermissions: ['permissions:read'] },
//     { path: '/admin/permissions/create', requiredPermissions: ['permissions:create'] },
//     { path: '/admin/permissions/:id', requiredPermissions: ['permissions:detail'] },
//     { path: '/admin/permissions/:id/edit', requiredPermissions: ['permissions:update'] },
//     {
//         path: '/admin/permissions/:id/delete',
//         requiredPermissions: ['permissions:delete'],
//     },

//     // ── IELTS Exams ────────────────────────────────────────────
//     { path: '/admin/exams', requiredPermissions: ['exams:read'] },
//     { path: '/admin/exams/create', requiredPermissions: ['exams:create'] },
//     { path: '/admin/exams/:id/edit', requiredPermissions: ['exams:update'] },
//     { path: '/admin/exams/:id/delete', requiredPermissions: ['exams:delete'] },

//     // ── Attempts ───────────────────────────────────────────────
//     { path: '/admin/attempts', requiredPermissions: ['attempts:read'] },
//     { path: '/admin/attempts/:id', requiredPermissions: ['attempts:read'] },
//     {
//         path: '/admin/attempts/:id/grade',
//         requiredPermissions: ['attempts:update', 'attempts:manage'],
//     },
//     { path: '/admin/attempts/:id/delete', requiredPermissions: ['attempts:delete'] },

//     // ── Analytics ──────────────────────────────────────────────
//     { path: '/admin/analytics', requiredPermissions: ['analytics:read'] },

//     // ── Settings ───────────────────────────────────────────────
//     {
//         path: '/admin/settings',
//         requiredPermissions: ['settings:read', 'settings:update'],
//         requireAll: false,
//     },
// ];

// // ─── Permission check logic ───────────────────────────────────

// /** Check if a user's permission list satisfies a route requirement */
// export function checkRouteAccess(
//     userPermissions: string[],
//     requiredPermissions: string[],
//     requireAll = false,
// ): boolean {
//     if (!userPermissions.length) return false;

//     if (
//         userPermissions.includes('admin:manage') ||
//         userPermissions.includes('*:*') ||
//         userPermissions.includes('*')
//     ) {
//         return true;
//     }

//     if (requireAll) {
//         return requiredPermissions.every((req) => userPermissions.includes(req));
//     }
//     return requiredPermissions.some((req) => userPermissions.includes(req));
// }

// /** Match a concrete path against a pattern that may include :param segments */
// function matchPath(pattern: string, path: string): boolean {
//     const patternParts = pattern.split('/');
//     const pathParts = path.split('/');
//     if (patternParts.length !== pathParts.length) return false;
//     return patternParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
// }

// // ─── Hook ─────────────────────────────────────────────────────

// export const usePermissionGuard = () => {
//     const user = useAuthStore((s) => s.user);
//     console.log('user', user);
//     /** Permissions array stored on the user object (adjust field name as needed) */
//     const userPermissions: string[] = useMemo(() => (user as any)?.permission ?? [], [user]);

//     /** Check if current user can access a given path */
//     const canAccess = useCallback(
//         (path: string): boolean => {
//             const rule = ROUTE_PERMISSIONS.find((r) => matchPath(r.path, path));
//             if (!rule) return true; // unprotected route
//             return checkRouteAccess(userPermissions, rule.requiredPermissions, rule.requireAll);
//         },
//         [userPermissions],
//     );

//     console.log("userPermissions", userPermissions);

//     /** Check a specific permission key, e.g. 'users:delete' */
//     const hasPermission = useCallback(
//         (permission: string): boolean => {
//             if (userPermissions.includes('admin:manage') || userPermissions.includes('*')) {
//                 return true;
//             }
//             return userPermissions.includes(permission);
//         },
//         [userPermissions],
//     );

//     /** Check any of a list */
//     const hasAnyPermission = useCallback(
//         (permissions: string[]): boolean => permissions.some((p) => hasPermission(p)),
//         [hasPermission],
//     );

//     /** Check all of a list */
//     const hasAllPermissions = useCallback(
//         (permissions: string[]): boolean => permissions.every((p) => hasPermission(p)),
//         [hasPermission],
//     );

//     return {
//         userPermissions,
//         canAccess,
//         hasPermission,
//         hasAnyPermission,
//         hasAllPermissions,
//     };
// };

// // ─── Server-side guard helper (for middleware / layout) ───────

// export function getAccessibleRoutes(userPermissions: string[]): string[] {
//     return ROUTE_PERMISSIONS.filter((r) =>
//         checkRouteAccess(userPermissions, r.requiredPermissions, r.requireAll),
//     ).map((r) => r.path);
// }

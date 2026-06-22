'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, BookOpenText, ClipboardCheck, Gamepad2, HelpCircle, Home, Key, LayoutDashboard, LogOut, LucideIcon, Menu, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import NotificationBell from '@/components/UI/NotificationBell';
import ToggleTheme from '@/components/UI/ToggleTheme';
import UserAvatar from '@/components/UI/UserAvatar';
import { useAuthStore } from '@/stores/authStore';

export type LayoutMenuItem = {
    path: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
};

type AppLayoutProps = {
    children: React.ReactNode;
    menuItems: 'dashboard' | 'admin';
    title?: string;
    subtitle?: string;
    homePath?: string;
    roleLabel?: string;
};

const DASHBOARD_MENU: LayoutMenuItem[] = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', exact: true },
    { path: '/dashboard/mocklist', icon: BookOpen, label: 'Mock Tests' },
    { path: '/dashboard/vocabulary', icon: BookOpenText, label: 'Vocabulary' },
    { path: '/dashboard/vgames', icon: Gamepad2, label: 'Vocabulary Games' },
];

const ADMIN_MENU: LayoutMenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', exact: true },
    { icon: BookOpen, label: 'Exams', path: '/admin/exams' },
    { icon: BookOpenText, label: 'Vocabulary', path: '/admin/vocabulary' },
    { icon: ClipboardCheck, label: 'Attempts', path: '/admin/attempts' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Shield, label: 'Roles', path: '/admin/roles' },
    { icon: Key, label: 'Permissions', path: '/admin/permissions' },
];

const AppLayout = ({ children, menuItems, title = 'IELTS PRIME', subtitle = 'Learning English', homePath = '/dashboard', roleLabel = 'User' }: AppLayoutProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const { user, logout } = useAuthStore();

    const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email : roleLabel;

    const handleLogout = async () => {
        await logout();
        router.replace('/auth/login');
    };

    const menu = menuItems === 'admin' ? ADMIN_MENU : DASHBOARD_MENU;

    const renderSidebar = () => (
        <div className="flex h-full flex-col">
            <div className="border-b border-gray-200 px-5 py-6 dark:border-gray-800">
                <Link href={homePath} onClick={() => setMobileOpen(false)} className="group flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
                        <BookOpen className="h-4 w-4 text-white" />
                    </div>

                    <div>
                        <p className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">{title}</p>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600">{subtitle}</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 space-y-0.5 px-3 py-4">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-700">Menu</p>

                {menu.map((item) => {
                    const isActive = item.exact ? pathname === item.path : pathname?.startsWith(item.path);

                    return (
                        <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}`}>
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1">{item.label}</span>

                            {isActive && <motion.div layoutId="nav-dot" className="h-1.5 w-1.5 rounded-full bg-white/70" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
                        </Link>
                    );
                })}
            </nav>

            <div className="space-y-2 border-t border-gray-200 px-3 pb-5 pt-4 dark:border-gray-800">
                {user && (
                    <div className="space-y-2 rounded-xl bg-gray-100 px-3 py-2.5 ring-1 ring-gray-200 dark:bg-gray-800/60 dark:ring-gray-700/50">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">{user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : displayName.charAt(0).toUpperCase()}</div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{displayName}</p>
                                <p className="truncate text-[10px] text-gray-400 dark:text-gray-500">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-150 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:flex">
                {renderSidebar()}
            </aside>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" />

                        <motion.aside initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:hidden">
                            {renderSidebar()}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className="flex min-h-screen flex-col lg:ml-64">
                <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 px-5 py-3.5 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 lg:hidden">
                            <Menu className="h-4 w-4" />
                        </button>

                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Welcome, <span className="text-blue-600 dark:text-blue-400">{displayName}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <NotificationBell />

                        <button className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
                            <HelpCircle className="h-4 w-4" />
                        </button>

                        <UserAvatar user={user} size="sm" />
                    </div>
                </header>

                <main className="flex-1 p-5">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>

            <ToggleTheme />
        </div>
    );
};

export default AppLayout;

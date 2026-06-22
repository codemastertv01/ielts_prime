// hooks/useAntiCheat.ts
'use client';
import { useEffect, useRef } from 'react';
import { useExamStore } from '@/stores/examStore';
import { showToast } from '@/services/toastService';

/**
 * Anti-cheat measures active during the exam:
 *  1. Tab-switch / visibility-change detection → pauses timer + logs warning
 *  2. DevTools dimension heuristic → pauses timer
 *  3. Keyboard shortcuts for DevTools are blocked
 *  4. Right-click context menu is disabled
 *
 * All effects are no-ops when `enabled` is false.
 */
export const useAntiCheat = (enabled: boolean = true) => {
    const { pauseTimer, resumeTimer, warningCount } = useExamStore();
    const pausedRef = useRef(false);
    const devToolsOpenRef = useRef(false);

    // ── Tab / window blur ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!enabled) return;

        const handleBlur = () => {
            if (pausedRef.current) return;
            pausedRef.current = true;
            pauseTimer();
            showToast.error('⚠️ Tab switching detected! Timer paused.');
        };

        const handleFocus = () => {
            if (!pausedRef.current) return;
            pausedRef.current = false;
            resumeTimer();
            showToast.success('✅ Welcome back. Timer resumed.');
        };

        const handleVisibility = () => {
            if (document.hidden) handleBlur();
            else handleFocus();
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [enabled, pauseTimer, resumeTimer]);

    // ── DevTools detection + keyboard block + context menu ───────────────────
    useEffect(() => {
        if (!enabled) return;

        const THRESHOLD = 160;

        const checkDevTools = () => {
            const open = window.outerHeight - window.innerHeight > THRESHOLD || window.outerWidth - window.innerWidth > THRESHOLD;

            if (open && !devToolsOpenRef.current) {
                devToolsOpenRef.current = true;
                pauseTimer();
                showToast.error('⚠️ DevTools detected! Timer paused.');
            } else if (!open && devToolsOpenRef.current) {
                devToolsOpenRef.current = false;
                resumeTimer();
            }
        };

        const devToolsInterval = setInterval(checkDevTools, 1_000);

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toUpperCase() === 'U') || e.key === 'F12') {
                e.preventDefault();
                showToast.error('🚫 This action is not allowed during the exam.');
            }
        };

        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            clearInterval(devToolsInterval);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [enabled, pauseTimer, resumeTimer]);

    return { warningCount };
};

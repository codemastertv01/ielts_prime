// hooks/useExamTimer.ts
'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useExamStore } from '../stores/examStore';

interface UseExamTimerOptions {
    enabled: boolean;
    onSectionExpired: (section: string) => void;
    /** Called every 30 s for persistence (auto-save to backend or just localStorage) */
    onAutoSave?: () => void;
}

/**
 * Drives a 1 Hz per-section countdown.
 * - Fires `onSectionExpired` exactly once per section when time hits 0.
 * - Calls `onAutoSave` every 30 ticks.
 * - Pauses the store timer on unmount / when disabled so drift is corrected.
 */
export function useExamTimer({ enabled, onSectionExpired, onAutoSave }: UseExamTimerOptions): void {
    const { tickCurrentSection, pauseTimer, resumeTimer } = useExamStore();

    const onExpiredRef = useRef(onSectionExpired);
    const onAutoSaveRef = useRef(onAutoSave);
    onExpiredRef.current = onSectionExpired;
    onAutoSaveRef.current = onAutoSave;

    const saveCounterRef = useRef(0);
    const expiredSectionRef = useRef<string | null>(null);

    const tick = useCallback(() => {
        const s = useExamStore.getState();
        if (!s.isTimerRunning || s.status !== 'IN_PROGRESS') return;

        const section = s.currentSection;
        const remaining = s.sectionRemainingSeconds[section] ?? 0;

        // Reset expired guard when section changes
        if (expiredSectionRef.current && expiredSectionRef.current !== section) {
            expiredSectionRef.current = null;
        }

        if (remaining <= 0) {
            if (expiredSectionRef.current !== section) {
                expiredSectionRef.current = section;
                pauseTimer();
                onExpiredRef.current(section);
            }
            return;
        }

        tickCurrentSection();

        saveCounterRef.current += 1;
        if (saveCounterRef.current >= 30) {
            saveCounterRef.current = 0;
            onAutoSaveRef.current?.();
        }
    }, [tickCurrentSection, pauseTimer]);

    useEffect(() => {
        if (!enabled) return;

        resumeTimer();
        saveCounterRef.current = 0;

        const id = setInterval(tick, 1_000);

        return () => {
            clearInterval(id);
            pauseTimer();
        };
    }, [enabled, tick, resumeTimer, pauseTimer]);
}

/**
 * Returns remaining time for the current section as "MM:SS".
 * Re-renders every store tick.
 */
export function useRemainingTime(): string {
    const remaining = useExamStore((s) => s.sectionRemainingSeconds[s.currentSection] ?? 0);
    const clamped = Math.max(0, remaining);
    const m = Math.floor(clamped / 60);
    const sec = clamped % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Returns the anti-cheat tab-switch detection hook.
 * Adds a warning count to the store when the user hides the page.
 */
export function useAntiCheat(active: boolean): void {
    const addWarning = useExamStore((s) => s.addWarning);

    useEffect(() => {
        if (!active) return;

        const onVisibility = () => {
            if (document.visibilityState === 'hidden') addWarning();
        };

        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [active, addWarning]);
}

// stores/examStore.ts
// ─── Encrypted Zustand Persist Store ─────────────────────────────────────────
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { SectionId, ExamData } from '@/types/exam';

// ─── XOR Encryption ───────────────────────────────────────────────────────────
// Prevents casual DevTools tampering. Not cryptographic — exam integrity only.

const ENC_KEY = '__IELTS_EXAM_SECURE_V10_2025__';

function xorEncrypt(data: string): string {
    try {
        let out = '';
        for (let i = 0; i < data.length; i++) {
            out += String.fromCharCode(data.charCodeAt(i) ^ ENC_KEY.charCodeAt(i % ENC_KEY.length));
        }
        return btoa(unescape(encodeURIComponent(out)));
    } catch {
        return btoa(data);
    }
}

function xorDecrypt(data: string): string {
    try {
        const raw = decodeURIComponent(escape(atob(data)));
        let out = '';
        for (let i = 0; i < raw.length; i++) {
            out += String.fromCharCode(raw.charCodeAt(i) ^ ENC_KEY.charCodeAt(i % ENC_KEY.length));
        }
        return out;
    } catch {
        try {
            return atob(data);
        } catch {
            return data;
        }
    }
}

const encryptedStorage = {
    getItem: (name: string): string | null => {
        const raw = localStorage.getItem(name);
        if (!raw) return null;
        try {
            return xorDecrypt(raw);
        } catch {
            localStorage.removeItem(name);
            return null;
        }
    },
    setItem: (name: string, value: string): void => {
        try {
            localStorage.setItem(name, xorEncrypt(value));
        } catch (e) {
            console.warn('[examStore] localStorage write failed:', e);
        }
    },
    removeItem: (name: string): void => localStorage.removeItem(name),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpeakingRecording {
    blob: Blob | null;
    url: string | null;
    duration: number;
    uploaded: boolean;
    progress?: number;
}

export interface ExamStoreState {
    // Hydration flag
    _hasHydrated: boolean;

    // Attempt info
    attemptId: string | null;
    examId: string | null;
    examData: ExamData | null;
    status: 'idle' | 'IN_PROGRESS' | 'submitted';

    // Per-section countdown timers (seconds)
    sectionRemainingSeconds: Record<string, number>;
    // Wall-clock timestamp when current section timer was last resumed
    currentSectionStartedAt: number | null;
    isTimerRunning: boolean;

    // Answers
    listeningAnswers: Record<string, string>;
    readingAnswers: Record<string, string>;
    writingTask1: string;
    writingTask2: string;
    speakingRecordings: Record<string, SpeakingRecording>;

    // Listening part state
    listeningPlayedParts: number[];
    lockedListeningParts: number[];

    // Navigation
    currentSection: SectionId;
    completedSections: string[];
    submittedSections: Set<string>;

    // Reading passage unlock
    completedPassages: number[]; // indices (0-based) of unlocked passages

    // Flagged questions
    flaggedQuestions: number[];

    // Anti-cheat
    warningCount: number;

    // ── Actions ────────────────────────────────────────────────────────────────

    setHydrated: () => void;

    setAttemptId: (id: string) => void;

    /** Initialize a fresh attempt */
    initAttempt: (examId: string, examData: ExamData) => void;

    /** Restore an in-progress exam after page reload (state already in store) */
    resumeFromStore: () => void;

    // Answers
    setListeningAnswer: (key: string, value: string) => void;
    setReadingAnswer: (key: string, value: string) => void;
    setWritingTask1: (text: string) => void;
    setWritingTask2: (text: string) => void;
    setSpeakingRecording: (key: string, rec: SpeakingRecording) => void;

    // Flags
    toggleFlag: (qNum: number) => void;

    // Listening part control
    markListeningPartPlayed: (partIndex: number) => void;
    lockListeningPart: (partIndex: number) => void;

    // Reading passage control
    unlockPassage: (passageIndex: number) => void;

    // Section control
    setSection: (section: SectionId) => void;
    markSectionCompleted: (section: string) => void;

    // Timer actions
    tickCurrentSection: () => void;
    pauseTimer: () => void;
    resumeTimer: () => void;

    addWarning: () => void;
    resetExam: () => void;

    // ── Selectors ──────────────────────────────────────────────────────────────

    getCurrentRemaining: () => number;
    getSectionOrder: () => SectionId[];
    canNavigateTo: (section: string) => boolean;
    isListeningPartLocked: (partIndex: number) => boolean;
    isSectionCompleted: (section: string) => boolean;

    getListeningProgress: () => { answered: number; total: number; allPlayed: boolean };
    getReadingProgress: () => { answered: number; total: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSectionTimers(examData: ExamData): Record<string, number> {
    const t: Record<string, number> = {};
    if (examData.listeningSection?.isEnabled) t.listening = (examData.listeningSection.timeLimitMinutes ?? 30) * 60;
    if (examData.readingSection?.isEnabled) t.reading = (examData.readingSection.timeLimitMinutes ?? 60) * 60;
    if (examData.writingSection?.isEnabled) t.writing = (examData.writingSection.timeLimitMinutes ?? 60) * 60;
    if (examData.speakingSection?.isEnabled) t.speaking = (examData.speakingSection.timeLimitMinutes ?? 14) * 60;
    return t;
}

function firstEnabledSection(examData: ExamData): SectionId {
    if (examData.listeningSection?.isEnabled) return 'listening';
    if (examData.readingSection?.isEnabled) return 'reading';
    if (examData.writingSection?.isEnabled) return 'writing';
    return 'speaking';
}

const INITIAL: Omit<ExamStoreState, 'setAttemptId' | 'setHydrated' | 'initAttempt' | 'resumeFromStore' | 'setListeningAnswer' | 'setReadingAnswer' | 'setWritingTask1' | 'setWritingTask2' | 'setSpeakingRecording' | 'toggleFlag' | 'markListeningPartPlayed' | 'lockListeningPart' | 'unlockPassage' | 'setSection' | 'markSectionCompleted' | 'tickCurrentSection' | 'pauseTimer' | 'resumeTimer' | 'addWarning' | 'resetExam' | 'getCurrentRemaining' | 'getSectionOrder' | 'canNavigateTo' | 'isListeningPartLocked' | 'isSectionCompleted' | 'getListeningProgress' | 'getReadingProgress' | '_hasHydrated'> = {
    attemptId: null,
    examId: null,
    examData: null,
    status: 'idle',
    sectionRemainingSeconds: {},
    currentSectionStartedAt: null,
    isTimerRunning: false,
    listeningAnswers: {},
    readingAnswers: {},
    writingTask1: '',
    writingTask2: '',
    speakingRecordings: {},
    listeningPlayedParts: [],
    lockedListeningParts: [],
    currentSection: 'listening',
    completedSections: [],
    submittedSections: new Set(),
    completedPassages: [],
    flaggedQuestions: [],
    warningCount: 0,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useExamStore = create<ExamStoreState>()(
    persist(
        immer((set, get) => ({
            _hasHydrated: false,
            ...INITIAL,

            setHydrated: () =>
                set((s) => {
                    s._hasHydrated = true;
                }),

            // ── Init / Resume ──────────────────────────────────────────────────────

            initAttempt: (examId, examData) =>
                set((s) => {
                    s.attemptId = null;
                    s.examId = examId;
                    s.examData = examData;
                    s.status = 'IN_PROGRESS';
                    s.sectionRemainingSeconds = buildSectionTimers(examData);
                    s.currentSection = firstEnabledSection(examData);
                    s.currentSectionStartedAt = Date.now();
                    s.isTimerRunning = true;
                    // Reset all progress
                    s.listeningAnswers = {};
                    s.readingAnswers = {};
                    s.writingTask1 = '';
                    s.writingTask2 = '';
                    s.speakingRecordings = {};
                    s.listeningPlayedParts = [];
                    s.lockedListeningParts = [];
                    s.completedSections = [];
                    s.submittedSections = new Set();
                    s.completedPassages = [];
                    s.flaggedQuestions = [];
                    s.warningCount = 0;
                }),

            resumeFromStore: () =>
                set((s) => {
                    // Called after hydration when status === 'IN_PROGRESS'
                    // Correct wall-clock drift from the time the page was away
                    if (s.currentSectionStartedAt && s.isTimerRunning) {
                        const elapsed = Math.floor((Date.now() - s.currentSectionStartedAt) / 1000);
                        const sec = s.currentSection;
                        const cur = s.sectionRemainingSeconds[sec] ?? 0;
                        s.sectionRemainingSeconds[sec] = Math.max(0, cur - elapsed);
                    }
                    s.currentSectionStartedAt = Date.now();
                    s.isTimerRunning = true;
                }),

            setAttemptId: (id) =>
                set((s) => {
                    s.attemptId = id;
                }),

            // ── Answers ────────────────────────────────────────────────────────────

            setListeningAnswer: (key, value) =>
                set((s) => {
                    s.listeningAnswers[key] = value;
                }),
            setReadingAnswer: (key, value) =>
                set((s) => {
                    s.readingAnswers[key] = value;
                }),
            setWritingTask1: (text) =>
                set((s) => {
                    s.writingTask1 = text;
                }),
            setWritingTask2: (text) =>
                set((s) => {
                    s.writingTask2 = text;
                }),
            setSpeakingRecording: (key, rec) =>
                set((s) => {
                    s.speakingRecordings[key] = rec;
                }),

            // ── Flags ──────────────────────────────────────────────────────────────

            toggleFlag: (qNum) =>
                set((s) => {
                    const idx = s.flaggedQuestions.indexOf(qNum);
                    if (idx >= 0) s.flaggedQuestions.splice(idx, 1);
                    else s.flaggedQuestions.push(qNum);
                }),

            // ── Listening ──────────────────────────────────────────────────────────

            markListeningPartPlayed: (partIndex) =>
                set((s) => {
                    if (!s.listeningPlayedParts.includes(partIndex)) s.listeningPlayedParts.push(partIndex);
                }),

            lockListeningPart: (partIndex) =>
                set((s) => {
                    if (!s.lockedListeningParts.includes(partIndex)) s.lockedListeningParts.push(partIndex);
                }),

            // ── Reading ────────────────────────────────────────────────────────────

            unlockPassage: (passageIndex) =>
                set((s) => {
                    if (!s.completedPassages.includes(passageIndex)) s.completedPassages.push(passageIndex);
                }),

            // ── Section navigation ─────────────────────────────────────────────────

            setSection: (section) =>
                set((s) => {
                    if (s.currentSection === section) return;
                    // Snapshot elapsed time for outgoing section
                    if (s.isTimerRunning && s.currentSectionStartedAt) {
                        const elapsed = Math.floor((Date.now() - s.currentSectionStartedAt) / 1000);
                        const cur = s.sectionRemainingSeconds[s.currentSection] ?? 0;
                        s.sectionRemainingSeconds[s.currentSection] = Math.max(0, cur - elapsed);
                    }
                    s.currentSection = section;
                    s.currentSectionStartedAt = Date.now();
                    s.isTimerRunning = true;
                }),

            markSectionCompleted: (section) =>
                set((s) => {
                    if (!s.completedSections.includes(section)) s.completedSections.push(section);
                }),

            // ── Timer ──────────────────────────────────────────────────────────────

            tickCurrentSection: () =>
                set((s) => {
                    if (!s.isTimerRunning) return;
                    const sec = s.currentSection;
                    const cur = s.sectionRemainingSeconds[sec] ?? 0;
                    if (cur > 0) s.sectionRemainingSeconds[sec] = cur - 1;
                }),

            pauseTimer: () =>
                set((s) => {
                    if (!s.isTimerRunning || !s.currentSectionStartedAt) return;
                    const elapsed = Math.floor((Date.now() - s.currentSectionStartedAt) / 1000);
                    const sec = s.currentSection;
                    s.sectionRemainingSeconds[sec] = Math.max(0, (s.sectionRemainingSeconds[sec] ?? 0) - elapsed);
                    s.isTimerRunning = false;
                    s.currentSectionStartedAt = null;
                }),

            resumeTimer: () =>
                set((s) => {
                    s.isTimerRunning = true;
                    s.currentSectionStartedAt = Date.now();
                }),

            addWarning: () =>
                set((s) => {
                    s.warningCount += 1;
                }),

            resetExam: () =>
                set((s) => {
                    Object.assign(s, { ...INITIAL, _hasHydrated: true, submittedSections: new Set() });
                }),

            // ── Selectors ──────────────────────────────────────────────────────────

            getCurrentRemaining: () => {
                const s = get();
                return s.sectionRemainingSeconds[s.currentSection] ?? 0;
            },

            getSectionOrder: () => {
                const ed = get().examData;
                if (!ed) return [];
                const order: SectionId[] = [];
                if (ed.listeningSection?.isEnabled) order.push('listening');
                if (ed.readingSection?.isEnabled) order.push('reading');
                if (ed.writingSection?.isEnabled) order.push('writing');
                if (ed.speakingSection?.isEnabled) order.push('speaking');
                return order;
            },

            canNavigateTo: (targetSection) => {
                const s = get();
                if (s.submittedSections.has(targetSection)) return false;
                if (s.completedSections.includes(targetSection)) return false;
                const order = s.getSectionOrder();
                const ci = order.indexOf(s.currentSection);
                const ti = order.indexOf(targetSection as SectionId);
                if (ti === ci) return true;
                if (ti < ci) return false;
                // Can only go to next if current is completed
                return s.completedSections.includes(s.currentSection);
            },

            isListeningPartLocked: (partIndex) => get().lockedListeningParts.includes(partIndex),

            isSectionCompleted: (section) => get().completedSections.includes(section),

            getListeningProgress: () => {
                const s = get();
                const sec = s.examData?.listeningSection;
                if (!sec) return { answered: 0, total: 0, allPlayed: false };
                const total = sec.parts.reduce((a, p) => a + p.questions.length, 0);
                const answered = Object.keys(s.listeningAnswers).length;
                const allPlayed = sec.parts.length > 0 && sec.parts.every((_, i) => s.listeningPlayedParts.includes(i));
                return { answered, total, allPlayed };
            },

            getReadingProgress: () => {
                const s = get();
                const sec = s.examData?.readingSection;
                if (!sec) return { answered: 0, total: 0 };
                const total = sec.passages.reduce((a, p) => a + p.questions.length, 0);
                const answered = Object.keys(s.readingAnswers).length;
                return { answered, total };
            },
        })),

        {
            name: 'IELTS_EXAM_STATE_V11',
            storage: {
                getItem: (name) => {
                    const str = encryptedStorage.getItem(name);
                    if (!str) return null;
                    try {
                        return JSON.parse(str);
                    } catch {
                        return null;
                    }
                },
                setItem: (name, value) => {
                    encryptedStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => encryptedStorage.removeItem(name),
            },

            // Only persist what's needed
            partialize: (s: ExamStoreState): any => ({
                attemptId: s.attemptId,
                examId: s.examId,
                examData: s.examData,
                status: s.status,
                sectionRemainingSeconds: s.sectionRemainingSeconds,
                currentSectionStartedAt: s.currentSectionStartedAt,
                isTimerRunning: s.isTimerRunning,
                listeningAnswers: s.listeningAnswers,
                readingAnswers: s.readingAnswers,
                writingTask1: s.writingTask1,
                writingTask2: s.writingTask2,
                speakingRecordings: Object.fromEntries(Object.entries(s.speakingRecordings).map(([k, v]) => [k, { ...v, blob: null }])),
                listeningPlayedParts: s.listeningPlayedParts,
                lockedListeningParts: s.lockedListeningParts,
                currentSection: s.currentSection,
                completedSections: s.completedSections,
                submittedSections: Array.from(s.submittedSections) as unknown as Set<string>,
                completedPassages: s.completedPassages,
                flaggedQuestions: s.flaggedQuestions,
                warningCount: s.warningCount,
            }),

            onRehydrateStorage: () => (state) => {
                if (!state) return;

                // Restore Set from persisted Array
                if (Array.isArray((state as any).submittedSections)) {
                    state.submittedSections = new Set<string>((state as any).submittedSections);
                }

                // Correct wall-clock drift
                if (state.status === 'IN_PROGRESS' && state.currentSectionStartedAt && state.isTimerRunning) {
                    const elapsed = Math.floor((Date.now() - state.currentSectionStartedAt) / 1000);
                    const sec = state.currentSection;
                    if (sec && state.sectionRemainingSeconds) {
                        const prev = state.sectionRemainingSeconds[sec] ?? 0;
                        state.sectionRemainingSeconds[sec] = Math.max(0, prev - elapsed);
                    }
                }

                // Timer must be restarted explicitly by component
                state.isTimerRunning = false;
                state.currentSectionStartedAt = null;
                state._hasHydrated = true;
            },
        }
    )
);

export function useRemainingTime(): string {
    const remaining = useExamStore((s) => s.sectionRemainingSeconds[s.currentSection] ?? 0);
    const clamped = Math.max(0, remaining);
    const m = Math.floor(clamped / 60);
    const sec = clamped % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

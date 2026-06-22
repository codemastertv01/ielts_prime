'use client';
import { ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Copy, Loader2, X } from 'lucide-react';
import { EntityStatusEnum } from '@/types/entity.status';
import { AuditLogEntry, ChangeHistoryEntry } from '@/types/attempt.types';

// ─── Design tokens ────────────────────────────────────────────────────────────

export const STATUS_CFG: Record<
    string,
    {
        label: string;
        color: string;
        dot: string;
        bg: string;
        ring: string;
        glow: string;
    }
> = {
    [EntityStatusEnum.IN_PROGRESS]: {
        label: 'In Progress',
        color: 'text-cyan-700 dark:text-cyan-300',
        dot: 'bg-cyan-400',
        bg: 'bg-cyan-50 dark:bg-cyan-950/60',
        ring: 'ring-1 ring-cyan-200 dark:ring-cyan-800',
        glow: 'shadow-cyan-200/40',
    },
    [EntityStatusEnum.SUBMITTED]: {
        label: 'Submitted',
        color: 'text-emerald-700 dark:text-emerald-300',
        dot: 'bg-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        ring: 'ring-1 ring-emerald-200 dark:ring-emerald-800',
        glow: 'shadow-emerald-200/40',
    },
    [EntityStatusEnum.GRADING]: {
        label: 'Grading',
        color: 'text-amber-700 dark:text-amber-300',
        dot: 'bg-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        ring: 'ring-1 ring-amber-200 dark:ring-amber-800',
        glow: 'shadow-amber-200/40',
    },
    [EntityStatusEnum.GRADED]: {
        label: 'Graded',
        color: 'text-violet-700 dark:text-violet-300',
        dot: 'bg-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-950/60',
        ring: 'ring-1 ring-violet-200 dark:ring-violet-800',
        glow: 'shadow-violet-200/40',
    },
    [EntityStatusEnum.EXPIRED]: {
        label: 'Expired',
        color: 'text-rose-700 dark:text-rose-300',
        dot: 'bg-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/60',
        ring: 'ring-1 ring-rose-200 dark:ring-rose-800',
        glow: 'shadow-rose-200/40',
    },
};

export const AUDIT_ACTION_STYLE: Record<string, string> = {
    ATTEMPT_STARTED: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300',
    READING_SUBMITTED: 'text-sky-700 bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300',
    LISTENING_SUBMITTED: 'text-sky-700 bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300',
    WRITING_SUBMITTED: 'text-indigo-700 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300',
    SPEAKING_SUBMITTED: 'text-indigo-700 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300',
    WRITING_GRADED: 'text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300',
    SPEAKING_GRADED: 'text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300',
    ADMIN_UPDATE: 'text-violet-700 bg-violet-100 dark:bg-violet-950/60 dark:text-violet-300',
    SOFT_DELETED: 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300',
    RESTORED: 'text-teal-700 bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300',
    AUTO_EXPIRED: 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300',
    ATTEMPT_EXPIRED: 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300',
    SPEAKING_RECORDING_SAVED: 'text-teal-700 bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300',
};

export const BAND_OPTIONS = [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

const BAND_GRADIENT = (score: number) => (score >= 7.5 ? 'from-emerald-500 to-teal-400' : score >= 6.5 ? 'from-sky-500 to-blue-500' : score >= 5.5 ? 'from-amber-500 to-orange-400' : score >= 4 ? 'from-orange-500 to-red-400' : 'from-rose-600 to-red-600');

// ─── Formatters ───────────────────────────────────────────────────────────────

export const fmt = (d?: string | null, long = false): string => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', long ? { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// ─── BandBadge ────────────────────────────────────────────────────────────────

export const BandBadge = ({ score, size = 'md' }: { score?: number; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) => {
    if (score == null) return <span className="text-gray-400 font-mono text-xs">—</span>;
    const g = BAND_GRADIENT(score);
    const s = { xs: 'w-7 h-7 text-[10px]', sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' }[size];
    return <div className={`${s} rounded-full bg-gradient-to-br ${g} flex items-center justify-center text-white font-black shadow-md flex-shrink-0 select-none`}>{score}</div>;
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────

export const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG[EntityStatusEnum.IN_PROGRESS];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color} ${cfg.bg} ${cfg.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
            {cfg.label}
        </span>
    );
};

// ─── SectionScoreMini ─────────────────────────────────────────────────────────

export const SectionMini = ({ l, r, w, s }: { l?: number; r?: number; w?: number; s?: number }) => {
    const items: [string, number | undefined, string][] = [
        ['L', l, 'text-cyan-600 dark:text-cyan-400'],
        ['R', r, 'text-blue-600 dark:text-blue-400'],
        ['W', w, 'text-indigo-600 dark:text-indigo-400'],
        ['S', s, 'text-violet-600 dark:text-violet-400'],
    ];

    return (
        <div className="flex gap-2.5">
            {items.map(([k, v, c]) => (
                <div key={k} className="text-center min-w-[24px]">
                    <div className={`text-[9px] font-black uppercase ${c}`}>{k}</div>
                    <div className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300 tabular-nums">{v ?? '—'}</div>
                </div>
            ))}
        </div>
    );
};

// ─── Collapsible Section ──────────────────────────────────────────────────────

export const Section = ({ title, icon, children, defaultOpen = true, badge }: { title: string; icon?: ReactNode; children: ReactNode; defaultOpen?: boolean; badge?: ReactNode }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl overflow-hidden">
            <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                <div className="flex items-center gap-2.5">
                    {icon && <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">{icon}</span>}
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</span>
                    {badge}
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                        <div className="border-t border-gray-100 dark:border-gray-800 p-5">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Field ────────────────────────────────────────────────────────────────────

export const Field = ({ label, value, mono = false, copiable = false }: { label: string; value: unknown; mono?: boolean; copiable?: boolean }) => {
    const [copied, setCopied] = useState(false);
    const v = value != null ? String(value) : '—';

    return (
        <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 pt-0.5 min-w-[80px]">{label}</span>
            <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-xs font-medium text-gray-800 dark:text-gray-200 text-right break-all leading-relaxed ${mono ? 'font-mono' : ''}`}>{v}</span>
                {copiable && v !== '—' && (
                    <button
                        type="button"
                        onClick={() => {
                            navigator.clipboard.writeText(v).catch(() => {});
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                        }}
                        className="text-gray-300 hover:text-gray-600 dark:hover:text-gray-300 transition flex-shrink-0"
                    >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── InfoCard ─────────────────────────────────────────────────────────────────

export const InfoCard = ({ title, icon, children, accent = 'gray' }: { title: string; icon?: ReactNode; children: ReactNode; accent?: 'gray' | 'violet' | 'amber' | 'emerald' }) => {
    const styles: Record<string, string> = {
        gray: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/80',
        violet: 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-200/60 dark:border-violet-800/40',
        amber: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40',
        emerald: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40',
    };
    return (
        <div className={`rounded-2xl border p-4 ${styles[accent]}`}>
            {(title || icon) && (
                <h4 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    {icon}
                    {title}
                </h4>
            )}
            <div className="space-y-0.5">{children}</div>
        </div>
    );
};

// ─── Toast ────────────────────────────────────────────────────────────────────

export const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
    <motion.div initial={{ opacity: 0, y: -16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.96 }} className={`fixed top-4 right-4 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white ${type === 'success' ? 'bg-emerald-600 shadow-emerald-200/50' : 'bg-rose-600 shadow-rose-200/50'}`}>
        {type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        {message}
    </motion.div>
);

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

export const ConfirmDialog = ({ title, desc, action, actionClass, icon, onConfirm, onClose, withReason = false, isLoading = false }: { title: string; desc: string; action: string; actionClass: string; icon: ReactNode; onConfirm: (reason?: string) => void; onClose: () => void; withReason?: boolean; isLoading?: boolean }) => {
    const [reason, setReason] = useState('');
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ scale: 0.93, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 12 }} className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
                <div className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">{icon}</div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                    {withReason && <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Sabab (ixtiyoriy)..." rows={2} className="mt-4 w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/30 resize-none" />}
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                        Bekor
                    </button>
                    <button type="button" onClick={() => onConfirm(reason || undefined)} disabled={isLoading} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl transition disabled:opacity-50 ${actionClass}`}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
                        {action}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── AnswerGrid ───────────────────────────────────────────────────────────────

export const AnswerGrid = ({
    answers,
    type,
}: {
    answers: Array<{
        passageNumber?: number;
        partNumber?: number;
        questionNumber: number;
        answer?: string;
        isCorrect?: boolean;
    }>;
    type: 'reading' | 'listening';
}) => {
    const correct = answers.filter((a) => a.isCorrect).length;
    const pct = answers.length ? Math.round((correct / answers.length) * 100) : 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className="h-2 bg-emerald-500 rounded-full" />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs font-semibold">
                    <span className="text-emerald-600 dark:text-emerald-400">✓ {correct}</span>
                    <span className="text-rose-500 dark:text-rose-400">✗ {answers.length - correct}</span>
                    <span className="text-gray-500 font-bold">{pct}%</span>
                </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {answers.map((a, i) => (
                    <div key={i} title={`Javob: ${a.answer || '?'}`} className={`rounded-xl p-2 text-center border transition-all hover:scale-105 cursor-default ${a.isCorrect ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40' : 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40'}`}>
                        <div className="text-[9px] text-gray-400 font-bold tabular-nums">
                            {type === 'reading' ? `P${a.passageNumber}` : `P${a.partNumber}`}·Q{a.questionNumber}
                        </div>
                        <div className={`text-[11px] font-bold truncate mt-0.5 ${a.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{a.answer || '—'}</div>
                        <div className={`mt-1 w-3.5 h-3.5 rounded-full mx-auto flex items-center justify-center text-white ${a.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>{a.isCorrect ? <Check className="w-2 h-2" /> : <X className="w-2 h-2" />}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── AuditTimeline ────────────────────────────────────────────────────────────

export const AuditTimeline = ({ entries }: { entries: AuditLogEntry[] }) => {
    if (!entries.length) return <p className="text-center text-sm text-gray-400 py-8">Yozuvlar yo'q</p>;

    return (
        <div className="relative pl-6 space-y-3">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" />
            {[...entries].map((e, i) => {
                const color = AUDIT_ACTION_STYLE[e.action] ?? 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
                return (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }} className="relative">
                        <div className="absolute -left-[17px] top-2.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600" />
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
                            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${color}`}>{e.action}</span>
                                <span className="text-[10px] text-gray-400 tabular-nums">{fmt(e.timestamp)}</span>
                            </div>
                            {e.note && <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">{e.note}</p>}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-gray-400">{e.performedBy}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${e.performedByRole === 'admin' ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400' : e.performedByRole === 'system' ? 'bg-gray-100 dark:bg-gray-700 text-gray-500' : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'}`}>{e.performedByRole}</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

// ─── ChangeHistoryList ────────────────────────────────────────────────────────

export const ChangeHistoryList = ({ entries }: { entries: ChangeHistoryEntry[] }) => {
    if (!entries.length) return <p className="text-center text-sm text-gray-400 py-8">O'zgarishlar yo'q</p>;

    return (
        <div className="space-y-3">
            {[...entries].map((e, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                        <span className="text-xs font-black font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-lg">{e.field}</span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 tabular-nums">{fmt(e.changedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-900/60 font-mono">{JSON.stringify(e.previousValue)}</span>
                        <span className="text-gray-400 font-bold">→</span>
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/60 font-mono">{JSON.stringify(e.newValue)}</span>
                    </div>
                    {e.reason && <p className="text-[10px] text-gray-400 mt-2 italic">"{e.reason}"</p>}
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">by {e.changedBy}</p>
                </div>
            ))}
        </div>
    );
};

// ─── GradeWritingForm ─────────────────────────────────────────────────────────

const sel = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 appearance-none cursor-pointer';
const lbl = 'block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5';
const ta = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none';

export const GradeWritingForm = ({ taskNumber, onSubmit, isLoading, onCancel }: { taskNumber: 1 | 2; onSubmit: (data: import('@/types/attempt.types').GradeWritingDto) => void; isLoading: boolean; onCancel: () => void }) => {
    const [f, setF] = useState({ ta: '', cc: '', lr: '', gr: '', feedback: '', aiFeedback: '' });
    const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
    const canSubmit = f.ta && f.cc && f.lr && f.gr;

    const criteria = [
        { key: 'ta', label: 'Task Achievement' },
        { key: 'cc', label: 'Coherence & Cohesion' },
        { key: 'lr', label: 'Lexical Resource' },
        { key: 'gr', label: 'Grammatical Range & Accuracy' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-[10px] font-black text-violet-600 dark:text-violet-400">{taskNumber}</div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Writing Vazifa {taskNumber} — Baholash</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {criteria.map(({ key, label }) => (
                    <div key={key}>
                        <label className={lbl}>{label}</label>
                        <select value={(f as Record<string, string>)[key]} onChange={(e) => set(key, e.target.value)} className={sel}>
                            <option value="">Tanlang...</option>
                            {BAND_OPTIONS.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            <div>
                <label className={lbl}>Feedback (o'quvchiga)</label>
                <textarea value={f.feedback} onChange={(e) => set('feedback', e.target.value)} rows={3} placeholder="Batafsil fikr-mulohaza..." className={ta} />
            </div>
            <div>
                <label className={lbl}>AI Feedback (ixtiyoriy)</label>
                <textarea value={f.aiFeedback} onChange={(e) => set('aiFeedback', e.target.value)} rows={2} placeholder="AI tahlili..." className={ta} />
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    Bekor
                </button>
                <button
                    type="button"
                    onClick={() =>
                        canSubmit &&
                        onSubmit({
                            taskNumber,
                            taskAchievement: Number(f.ta),
                            coherenceCohesion: Number(f.cc),
                            lexicalResource: Number(f.lr),
                            grammaticalRange: Number(f.gr),
                            feedback: f.feedback || undefined,
                            aiFeedback: f.aiFeedback || undefined,
                        })
                    }
                    disabled={isLoading || !canSubmit}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-40"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Bahola
                </button>
            </div>
        </div>
    );
};

// ─── GradeSpeakingForm ────────────────────────────────────────────────────────

export const GradeSpeakingForm = ({ partNumber, onSubmit, isLoading, onCancel }: { partNumber: 1 | 2 | 3; onSubmit: (data: import('@/types/attempt.types').GradeSpeakingDto) => void; isLoading: boolean; onCancel: () => void }) => {
    const [f, setF] = useState({ fc: '', lr: '', gr: '', pron: '', transcript: '', feedback: '', aiFeedback: '' });
    const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
    const canSubmit = f.fc && f.lr && f.gr && f.pron;

    return (
        <div className="space-y-4">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Speaking Qism {partNumber} — Baholash</p>
            <div className="grid grid-cols-2 gap-3">
                {[
                    ['fc', 'Fluency & Coherence'],
                    ['lr', 'Lexical Resource'],
                    ['gr', 'Grammatical Range'],
                    ['pron', 'Pronunciation'],
                ].map(([k, l]) => (
                    <div key={k}>
                        <label className={lbl}>{l}</label>
                        <select value={(f as Record<string, string>)[k]} onChange={(e) => set(k, e.target.value)} className={sel}>
                            <option value="">Tanlang...</option>
                            {BAND_OPTIONS.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            <div>
                <label className={lbl}>Transcript</label>
                <textarea value={f.transcript} onChange={(e) => set('transcript', e.target.value)} rows={2} placeholder="Audio matni..." className={ta} />
            </div>
            <div>
                <label className={lbl}>Feedback</label>
                <textarea value={f.feedback} onChange={(e) => set('feedback', e.target.value)} rows={2} placeholder="Fikr-mulohaza..." className={ta} />
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    Bekor
                </button>
                <button
                    type="button"
                    onClick={() =>
                        canSubmit &&
                        onSubmit({
                            partNumber,
                            fluencyCoherence: Number(f.fc),
                            lexicalResource: Number(f.lr),
                            grammaticalRange: Number(f.gr),
                            pronunciation: Number(f.pron),
                            transcript: f.transcript || undefined,
                            feedback: f.feedback || undefined,
                            aiFeedback: f.aiFeedback || undefined,
                        })
                    }
                    disabled={isLoading || !canSubmit}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-40"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Bahola
                </button>
            </div>
        </div>
    );
};

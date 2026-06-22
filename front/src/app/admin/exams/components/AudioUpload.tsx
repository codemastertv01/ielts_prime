'use client';
import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Link as LinkIcon, Loader2, Music, Pause, Play, RefreshCw, Trash2, Upload } from 'lucide-react';
import { uploadFile } from '@/utils/firebase';

interface Props {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
}

type Tab = 'url' | 'upload';

const inpCls = (err: boolean) => `w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition ${err ? 'border-red-400 dark:border-red-500 focus:ring-red-400/30' : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500/40 focus:border-indigo-400'}`;

export const AudioUpload = ({ value, onChange, label = 'Audio', hint = 'MP3, WAV, OGG · Max 50MB', error, disabled = false }: Props) => {
    const [tab, setTab] = useState<Tab>(value ? 'url' : 'upload');
    const [urlInput, setUrlInput] = useState(value ?? '');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadErr, setUploadErr] = useState('');
    const [isDragging, setDrag] = useState(false);
    const [isPlaying, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const hasAudio = !!value;
    const anyErr = error || uploadErr;

    const applyUrl = () => {
        const t = urlInput.trim();
        if (!t) return;
        if (!/^https?:\/\/.+/.test(t)) {
            setUploadErr('URL must start with https://');
            return;
        }
        setUploadErr('');
        onChange(t);
    };

    const handleFile = useCallback(
        async (file: File) => {
            if (!file.type.startsWith('audio/')) {
                setUploadErr('Only audio files are accepted');
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                setUploadErr("File must not be larger than 50MB");
                return;
            }
            setUploadErr('');
            setUploading(true);
            setProgress(0);
            try {
                const url = await uploadFile(file, 'audio', (pct) => setProgress(pct.percent));
                onChange(url);
                setUrlInput(url);
                setTab('url');
            } catch (e: unknown) {
                setUploadErr((e as Error).message ?? 'Upload failed');
            } finally {
                setUploading(false);
                setProgress(0);
            }
        },
        [onChange]
    );

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setPlaying((p) => !p);
    };

    const handleRemove = () => {
        onChange('');
        setUrlInput('');
        setUploadErr('');
        if (audioRef.current) audioRef.current.pause();
        setPlaying(false);
        setTab('upload');
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{label}</label>}

            {/* Player */}
            <AnimatePresence>
                {hasAudio && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                        <button type="button" onClick={togglePlay} className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center flex-shrink-0 transition">
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
                                <Music className="w-3.5 h-3.5 flex-shrink-0" /> Audio uploaded
                            </p>
                            <p className="text-[10px] text-indigo-500 dark:text-indigo-400 truncate mt-0.5">{value}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                                type="button"
                                title="Change URL"
                                onClick={() => {
                                    setUrlInput(value);
                                    setTab('url');
                                }}
                                className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition"
                            >
                                <LinkIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                title="Upload again"
                                onClick={() => {
                                    setTab('upload');
                                    fileRef.current?.click();
                                }}
                                className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" title="Delete" onClick={handleRemove} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <audio ref={audioRef} src={value} onEnded={() => setPlaying(false)} className="hidden" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {(['url', 'upload'] as Tab[]).map((t) => (
                    <button key={t} type="button" onClick={() => setTab(t)} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                        {t === 'url' ? (
                            <>
                                <LinkIcon className="w-3.5 h-3.5" /> URL
                            </>
                        ) : (
                            <>
                                <Upload className="w-3.5 h-3.5" /> Upload
                            </>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {tab === 'url' ? (
                    <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                        <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => {
                                setUrlInput(e.target.value);
                                setUploadErr('');
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && applyUrl()}
                            placeholder="https://cdn.example.com/audio.mp3"
                            disabled={disabled}
                            className={`${inpCls(!!anyErr)} flex-1`}
                        />
                        <button type="button" onClick={applyUrl} disabled={!urlInput.trim() || disabled} className="px-3.5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50 flex-shrink-0">
                            {hasAudio ? "Change" : "Apply"}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDrag(true);
                            }}
                            onDragLeave={() => setDrag(false)}
                            onDrop={handleDrop}
                            onClick={() => !uploading && !disabled && fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'} ${uploading || disabled ? 'pointer-events-none opacity-60' : ''}`}
                        >
                            {uploading ? (
                                <div className="space-y-2">
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Uploading... {progress}%</p>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Music className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{hasAudio ? 'Replace with a new audio file' : 'Drop an audio file or click to upload'}</p>
                                    <p className="text-[11px] text-gray-400 mt-1">{hint}</p>
                                </>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    </motion.div>
                )}
            </AnimatePresence>

            {anyErr && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {anyErr}
                </p>
            )}
        </div>
    );
};

export default AudioUpload;

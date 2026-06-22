'use client';
import { useRef, useState } from 'react';
import { Upload, X, Music, Image as ImageIcon, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadFile, UploadType } from '@/utils/firebase';

interface FileUploadProps {
    type: UploadType;
    label?: string;
    value?: string;
    onChange: (url: string) => void;
    accept?: string;
    maxSizeMB?: number;
}

const ACCEPT: Record<UploadType, string> = {
    audio: 'audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm',
    image: 'image/jpeg,image/png,image/webp,image/gif',
};

const MAX_SIZE: Record<UploadType, number> = {
    audio: 50, // MB
    image: 10,
};

export const FileUpload = ({ type, label, value, onChange, accept, maxSizeMB }: FileUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const maxMB = maxSizeMB ?? MAX_SIZE[type];

    const handleFile = async (file: File) => {
        setError('');

        // Size check
        if (file.size > maxMB * 1024 * 1024) {
            setError(`Fayl hajmi ${maxMB}MB dan katta bo'lmasin`);
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const url = await uploadFile(file, type, (p) => setProgress(p.percent));
            onChange(url);
        } catch (e: any) {
            setError(e.message || 'Upload xatosi');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleClear = () => {
        onChange('');
        if (inputRef.current) inputRef.current.value = '';
    };

    const isAudio = type === 'audio';
    const Icon = isAudio ? Music : ImageIcon;

    return (
        <div className="space-y-2">
            {label && <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>}

            {/* Drop zone */}
            {!value && (
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50'} ${uploading ? 'pointer-events-none opacity-70' : ''}`}
                >
                    {uploading ? (
                        <div className="space-y-3">
                            <Loader className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Yuklanmoqda... {progress}%</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{isAudio ? 'Audio fayl yuklang' : 'Rasm yuklang'}</p>
                            <p className="text-xs text-gray-400">{dragOver ? "Qo'yib yuboring" : `Bosing yoki sürükleyin • Maks ${maxMB}MB`}</p>
                            {isAudio && <p className="text-xs text-gray-400">MP3, WAV, OGG, MP4</p>}
                            {!isAudio && <p className="text-xs text-gray-400">JPG, PNG, WEBP, GIF</p>}
                        </div>
                    )}
                </div>
            )}

            {/* Preview */}
            {value && (
                <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            {isAudio ? (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                        <Music className="w-3.5 h-3.5" /> Audio yuklandi
                                    </p>
                                    <audio controls src={value} className="w-full h-10" style={{ maxWidth: '100%' }} />
                                    <p className="text-xs text-gray-400 truncate">{value}</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5" /> Rasm yuklandi
                                    </p>
                                    <img src={value} alt="Preview" className="max-h-40 rounded-lg object-contain border border-gray-200 dark:border-gray-700" />
                                    <p className="text-xs text-gray-400 truncate">{value}</p>
                                </div>
                            )}
                        </div>
                        <button type="button" onClick={handleClear} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-gray-400 hover:text-red-500 transition-colors flex-shrink-0" title="O'chirish">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Replace button */}
                    <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Almashish
                    </button>
                </div>
            )}

            {/* URL input (manual) */}
            <div className="flex gap-2">
                <input type="url" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={`Yoki URL kiriting...`} className="flex-1 text-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
            )}

            <input ref={inputRef} type="file" accept={accept ?? ACCEPT[type]} onChange={handleInputChange} className="hidden" />
        </div>
    );
};

export default FileUpload;

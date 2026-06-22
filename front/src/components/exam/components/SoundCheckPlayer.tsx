'use client';
import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '@/components/UI';

interface SoundCheckPlayerProps {
    /** Audio URL to play for the sound check */
    audioUrl: string;
    onComplete: () => void;
}

const SoundCheckPlayer = ({ audioUrl, onComplete }: SoundCheckPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [played, setPlayed] = useState(false);
    const [volume, setVolume] = useState(0.7); // 0 – 1
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Keep audio volume in sync
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    const play = () => {
        const a = audioRef.current;
        if (!a) return;
        a.currentTime = 0;
        a.volume = volume;
        a.play()
            .then(() => {
                setIsPlaying(true);
                setPlayed(true);
            })
            .catch(() => {});
    };

    const stop = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={() => {
                    const a = audioRef.current;
                    if (a) setCurrentTime(a.currentTime);
                }}
                onLoadedMetadata={() => {
                    const a = audioRef.current;
                    if (a && isFinite(a.duration)) setDuration(a.duration);
                }}
            />

            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-base font-bold text-gray-900">Sound Check</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Put on your headphones and click <strong>Play sound</strong> to test your audio. Adjust the volume using the slider below.
                    </p>
                </div>

                {/* Play / Stop button */}
                <div className="flex items-center gap-4">
                    <Button unstyled onClick={isPlaying ? stop : play} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${isPlaying ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        <Volume2 className="w-4 h-4" />
                        {isPlaying ? 'Stop' : 'Play sound'}
                    </Button>

                    {/* Progress bar (while playing) */}
                    {isPlaying && duration > 0 && (
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                        </div>
                    )}
                </div>

                {/* Volume Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Volume</span>
                        <span className="font-semibold text-gray-700">{Math.round(volume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Mute icon */}
                        <Button unstyled onClick={() => setVolume(0)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                            <VolumeX className="w-4 h-4" />
                        </Button>

                        {/* Slider */}
                        <div className="relative flex-1 h-5 flex items-center">
                            <div className="absolute inset-x-0 h-1.5 bg-gray-200 rounded-full">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${volume * 100}%` }} />
                            </div>
                            <Input
                                unstyled
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="relative w-full h-1.5 appearance-none bg-transparent cursor-pointer
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:w-4
                                    [&::-webkit-slider-thumb]:h-4
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:bg-blue-600
                                    [&::-webkit-slider-thumb]:shadow-md
                                    [&::-webkit-slider-thumb]:cursor-pointer
                                    [&::-moz-range-thumb]:w-4
                                    [&::-moz-range-thumb]:h-4
                                    [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:bg-blue-600
                                    [&::-moz-range-thumb]:border-0"
                            />
                        </div>

                        {/* Max icon */}
                        <Button unstyled onClick={() => setVolume(1)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                            <Volume2 className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Volume level labels */}
                    <div className="flex justify-between text-[10px] text-gray-300 px-7">
                        {['Mute', 'Low', 'Medium', 'High', 'Max'].map((l) => (
                            <span key={l}>{l}</span>
                        ))}
                    </div>
                </div>

                {/* Visual equaliser when playing */}
                {isPlaying && (
                    <div className="flex items-center justify-center gap-1">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-blue-400 rounded-full animate-bounce"
                                style={{
                                    height: `${8 + Math.sin(i * 0.8) * 6}px`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '0.7s',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Continue / prompt */}
                {played ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Sound played successfully. Can you hear it clearly?</span>
                        </div>
                        <Button unstyled onClick={onComplete} className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all">
                            Yes, continue to exam →
                        </Button>
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 text-center">Play the sound first before continuing</p>
                )}
            </div>
        </div>
    );
};

export default SoundCheckPlayer;

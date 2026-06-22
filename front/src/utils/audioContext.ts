// utils/audioContext.ts
// Bitta global AudioContext — SoundCheck'da unlock, ExamListening'da ishlatiladi

let _ctx: AudioContext | null = null

export function getAudioContext(): AudioContext {
    if (!_ctx || _ctx.state === 'closed') {
        _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return _ctx
}

export async function unlockAudioContext(): Promise<void> {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
        await ctx.resume()
    }
}

export function isAudioUnlocked(): boolean {
    return _ctx !== null && _ctx.state === 'running'
}
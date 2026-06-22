export const checkPasswordStrength = (password: string): PasswordStrengthResult => {
    let score = 0
    const feedback: string[] = []

    if (!password) {
        return { score: 0, feedback: ['Password is required'] }
    }

    if (password.length >= 8) score++
    else feedback.push('Use at least 8 characters')

    if (password.length >= 12) score++

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        score++
    } else {
        feedback.push('Include both uppercase and lowercase letters')
    }

    if (/\d/.test(password)) {
        score++
    } else {
        feedback.push('Include at least one number')
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++
    } else {
        feedback.push('Include at least one special character')
    }

    const commonPatterns = [/^123/, /^abc/i, /password/i, /qwerty/i, /^000/, /1234/]
    if (commonPatterns.some(p => p.test(password))) {
        score = Math.max(0, score - 2)
        feedback.push('Avoid common patterns and words')
    }

    score = Math.min(4, Math.max(0, Math.floor(score * 0.8)))

    return {
        score,
        strength: (['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'] as const)[score],
        feedback,
    }
}

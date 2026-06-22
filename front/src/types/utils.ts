interface PasswordStrengthResult {
    score: number
    strength?: string
    feedback: string[]
}

interface AuthError {
    message: string
    code: string
    errors?: Record<string, unknown>
}

interface AuditLogEntry {
    timestamp: string
    event: string
    data: Record<string, unknown>
    userAgent: string
}

interface AuditLogFilter {
    event?: string
    since?: string | Date
}

interface SessionManagerOptions {
    warningTime?: number
    onWarning?: () => void
    onExpiry?: () => void
}

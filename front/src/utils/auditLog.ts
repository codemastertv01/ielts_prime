export class AuditLogger {
    private maxLogs: number
    private logs: AuditLogEntry[]

    constructor(maxLogs = 100) {
        this.maxLogs = maxLogs
        this.logs = this.loadLogs()
    }

    private loadLogs(): AuditLogEntry[] {
        try {
            const stored = localStorage.getItem('AUDIT_LOGS')
            return stored ? (JSON.parse(stored) as AuditLogEntry[]) : []
        } catch {
            return []
        }
    }

    private saveLogs(): void {
        try {
            localStorage.setItem(
                'AUDIT_LOGS',
                JSON.stringify(this.logs.slice(-this.maxLogs)),
            )
        } catch (error: unknown) {
            console.error('Failed to save audit logs:', error)
        }
    }

    log(event: string, data: Record<string, unknown> = {}): void {
        const logEntry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            event,
            data,
            userAgent: navigator.userAgent,
        }

        this.logs.push(logEntry)

        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs)
        }

        this.saveLogs()

        // Log to console in development (Vite env)
        if (
            typeof import.meta !== 'undefined' &&
            (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV
        ) {
            console.log('[AUDIT]', logEntry)
        }
    }

    getLogs(filter: AuditLogFilter = {}): AuditLogEntry[] {
        let filtered = [...this.logs]

        if (filter.event) {
            filtered = filtered.filter(log => log.event === filter.event)
        }

        if (filter.since) {
            const since = new Date(filter.since).getTime()
            filtered = filtered.filter(
                log => new Date(log.timestamp).getTime() >= since,
            )
        }

        return filtered
    }

    clear(): void {
        this.logs = []
        this.saveLogs()
    }
}

export const auditLogger = new AuditLogger()

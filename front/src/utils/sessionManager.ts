export class SessionManager {
    private warningTime: number
    private onWarning: () => void
    private onExpiry: () => void
    private timer: ReturnType<typeof setTimeout> | null

    constructor(options: SessionManagerOptions = {}) {
        this.warningTime = options.warningTime ?? 2 * 60 * 1000
        this.onWarning = options.onWarning ?? (() => { })
        this.onExpiry = options.onExpiry ?? (() => { })
        this.timer = null
    }

    start(expiryTime: number): void {
        this.stop()

        const now = Date.now()
        const timeUntilExpiry = expiryTime - now
        const timeUntilWarn = timeUntilExpiry - this.warningTime

        if (timeUntilWarn > 0) {
            this.timer = setTimeout(() => {
                this.onWarning()
                setTimeout(() => this.onExpiry(), this.warningTime)
            }, timeUntilWarn)
        } else if (timeUntilExpiry > 0) {
            this.timer = setTimeout(() => this.onExpiry(), timeUntilExpiry)
        } else {
            this.onExpiry()
        }
    }

    stop(): void {
        if (this.timer !== null) {
            clearTimeout(this.timer)
            this.timer = null
        }
    }

    extend(newExpiryTime: number): void {
        this.start(newExpiryTime)
    }
}

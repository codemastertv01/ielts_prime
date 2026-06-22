export interface UserAnalytics {
    totalAttempts: number
    averageOverallBandScore: number
    sectionAverages: {
        reading: number
        listening: number
        writing: number
        speaking: number
    }
    strongestSection?: {
        name: string
        score: number
    } | null
    weakestSection?: {
        name: string
        score: number
    } | null
    progressTrend: {
        attemptDate: string
        attemptNumber: number
        overallBandScore?: number
    }[]
}


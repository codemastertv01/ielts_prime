import { EntityStatus } from "./entity.status"

export interface IELTSReport {
    attempt: {
        id: string
        examTitle: string
        attemptNumber: number
        submittedAt?: string
        timeSpent: string
        status: EntityStatus
    }
    scores: {
        overall: number | string
        reading: number | string
        listening: number | string
        writing: number | string
        speaking: number | string
    }
    recommendations: string[]
}

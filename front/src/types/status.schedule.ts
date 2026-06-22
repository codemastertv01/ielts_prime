import { EntityStatus } from "./entity.status"
import { MetadataInfo } from "./metadata"

export interface StatusSchedule {
    scheduledStatus: EntityStatus
    scheduledAt: string
    setBy: MetadataInfo
    reason?: string
}

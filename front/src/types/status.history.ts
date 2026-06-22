import { EntityStatus } from "./entity.status"
import { MetadataInfo } from "./metadata"

export interface StatusHistory {
    fromStatus: EntityStatus
    toStatus: EntityStatus
    changedAt: string
    changedBy: MetadataInfo
    reason?: string
    isAutomatic?: boolean
}

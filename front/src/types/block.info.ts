import { MetadataInfo } from "./metadata"

export interface BlockInfo {
    isBlocked: boolean
    blockReason?: string | null
    blockedUntil?: string | null
    blockedBy?: MetadataInfo | null
    blockedAt?: string | null
}

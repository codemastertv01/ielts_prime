import { MetadataInfo } from "./metadata"

export interface FieldChange {
    field: string
    oldValue: any
    newValue: any
    changedAt: string
    changedBy: MetadataInfo
}

export interface AuditLog {
    action: string
    performedBy: MetadataInfo
    timestamp: string
    changes: FieldChange[]
}

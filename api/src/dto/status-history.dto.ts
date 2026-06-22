import { EntityStatus } from './entity-status.dto';
import { MetadataInfo } from './metadata-info.dto';

export interface StatusHistory {
    fromStatus: EntityStatus;
    changedBy: MetadataInfo;
    toStatus: EntityStatus;
    changedAt: Date;
    reason?: string;
    isAutomatic: boolean;
}

import { MetadataInfo } from './metadata-info.dto';

export interface FieldChange {
    field: string;
    oldValue: any;
    newValue: any;
    changedAt: Date;
    changedBy: MetadataInfo;
}

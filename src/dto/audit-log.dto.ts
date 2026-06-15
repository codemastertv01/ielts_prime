import { FieldChange } from './field-change.dto';
import { MetadataInfo } from './metadata-info.dto';
import { PermissionOperation } from './permission-operation.dto';

export interface AuditLog {
    action: PermissionOperation;
    performedBy: MetadataInfo;
    changes?: FieldChange[];
    timestamp: Date;
}

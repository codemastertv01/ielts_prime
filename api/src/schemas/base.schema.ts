import { Document } from 'mongoose';
import { Prop, Schema } from '@nestjs/mongoose';
import { AuditLog } from '../dto/audit-log.dto';
import { FieldChange } from '../dto/field-change.dto';
import { EntityStatus } from '../dto/entity-status.dto';
import { StatusHistory } from '../dto/status-history.dto';
import { StatusSchedule } from '../dto/status-schedule.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';

@Schema({ timestamps: true })
export class BaseEntity extends Document {
    @Prop({ type: Object, required: true })
    createdBy: MetadataInfo;

    @Prop({ type: Object })
    updatedBy: MetadataInfo[];

    @Prop({ type: Object })
    deletedBy: MetadataInfo[];

    @Prop({ type: [Object], default: [] })
    updateHistory: FieldChange[];

    @Prop({ type: [Object], default: [] })
    auditLog: AuditLog[];

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Date })
    scheduledDeletionAt?: Date;

    @Prop({ type: Date })
    restoredAt?: Date;

    @Prop({ type: Object })
    restoredBy: MetadataInfo[];

    @Prop({ type: String, enum: Object.values(EntityStatus), default: EntityStatus.PENDING })
    status: EntityStatus;

    @Prop({ type: [Object], default: [] })
    statusHistory: StatusHistory[];

    @Prop({ type: Date })
    activationScheduledAt?: Date;

    @Prop({ type: Number, default: 100000 })
    activeDurationDays: number;

    @Prop({ type: Date })
    activatedAt?: Date;

    @Prop({ type: Date })
    archiveScheduledAt?: Date;

    @Prop({ type: [Object], default: [] })
    statusSchedules: StatusSchedule[];

    @Prop({ type: Date })
    inactivatedAt?: Date;

    @Prop({ type: Object })
    inactivatedBy?: MetadataInfo;

    @Prop({ type: String })
    inactiveReason?: string;
}

import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LocationMetadata, LocationMetadataSchema } from './location.metadata.schema';
import { UserAgentMetadata, UserAgentMetadataSchema } from './user-agent.metadata.schema';

@Schema({ _id: false })
export class AuditMetadata {
    @Prop({ type: Types.ObjectId, trim: true, maxlength: 100, required: true })
    by: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    at: Date;

    @Prop({ type: String, trim: true, maxlength: 50, required: true })
    ip: string;

    @Prop({ type: LocationMetadataSchema, required: false })
    location?: LocationMetadata;

    @Prop({ type: UserAgentMetadataSchema, required: false })
    client?: UserAgentMetadata;
}

export const AuditMetadataSchema = SchemaFactory.createForClass(AuditMetadata);

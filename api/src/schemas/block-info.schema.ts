import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { MetadataInfo } from '../dto/metadata-info.dto';

@Schema({ _id: false })
export class BlockInfo {
    @Prop({ type: Boolean, default: false })
    isBlocked: boolean;

    @Prop({ type: String, trim: true, maxlength: 500 })
    blockReason: string;

    @Prop({ type: Date, default: null })
    blockedUntil: Date | null;

    @Prop({ type: Object, default: null })
    blockedBy: MetadataInfo | null;

    @Prop({ type: Date, default: null })
    blockedAt: Date | null;
}

export const BlockInfoSchema = SchemaFactory.createForClass(BlockInfo);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class UserAgentMetadata {
    @Prop({ type: String, trim: true, maxlength: 300 })
    userAgent?: string;

    @Prop({ type: String, trim: true, maxlength: 100 })
    browser?: string;

    @Prop({ type: String, trim: true, maxlength: 100 })
    device?: string;

    @Prop({ type: String, trim: true, maxlength: 100 })
    os?: string;

    @Prop({ type: Boolean, default: false })
    vpn?: boolean;
}

export const UserAgentMetadataSchema = SchemaFactory.createForClass(UserAgentMetadata);

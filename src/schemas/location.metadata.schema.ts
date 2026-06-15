import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class LocationMetadata {
    @Prop({ type: String, trim: true, maxlength: 100 })
    country?: string; // Mamlakat nomi

    @Prop({ type: String, trim: true, maxlength: 10 })
    countryCode?: string; // Mamlakat kodi (ISO 3166-1 alpha-2)

    @Prop({ type: String, trim: true, maxlength: 100 })
    region?: string; // Viloyat/shtat

    @Prop({ type: String, trim: true, maxlength: 100 })
    city?: string; // Shaxar

    @Prop({ type: Number, min: -90, max: 90 })
    latitude?: number;

    @Prop({ type: Number, min: -180, max: 180 })
    longitude?: number;
}

export const LocationMetadataSchema = SchemaFactory.createForClass(LocationMetadata);

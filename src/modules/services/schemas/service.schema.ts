import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ServiceDocument = HydratedDocument<WellnessService>;

@Schema({ timestamps: true }) //adds createdAt, UpdatedAt automatically
export class WellnessService {
  @Prop({ required: true })
  declare name: string;

  @Prop()
  declare description?: string;

  @Prop({ required: true })
  declare durationMinutes: number;

  @Prop({ required: true, type: Number })
  declare price: number;

  @Prop({ required: true, enum: ['massage', 'meditation', 'herbal', 'beauty', 'retreat'] })
  declare category: string;

  @Prop({ default: true })
  declare isActive: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(WellnessService);

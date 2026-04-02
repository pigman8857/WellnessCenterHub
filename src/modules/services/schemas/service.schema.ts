import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ServiceDocument = HydratedDocument<WellnessService>;

@Schema({ timestamps: true }) //adds createdAt, UpdatedAt automatically
export class WellnessService {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  durationMinutes: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, enum: ['massage', 'meditation', 'herbal', 'beauty', 'retreat'] })
  category: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(WellnessService);

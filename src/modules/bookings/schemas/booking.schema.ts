import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema, HydratedDocument, Types } from 'mongoose';
import { Customer } from 'src/modules/customers/schemas/customer.schema';
import { WellnessService } from 'src/modules/services/schemas/service.schema';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Customer.name, required: true })
  customer: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: WellnessService.name, required: true })
  service: Types.ObjectId;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({ required: true })
  startTime: string; // "14:00"

  @Prop({
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop()
  specialRequests: string;

  @Prop({ type: Number })
  totalPrice: number;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema, HydratedDocument, Types } from 'mongoose';
import { Customer } from 'src/modules/customers/schemas/customer.schema';
import { WellnessService } from 'src/modules/services/schemas/service.schema';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Customer.name, required: true })
  declare customer: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: WellnessService.name, required: true })
  declare service: Types.ObjectId;

  @Prop({ required: true })
  declare appointmentDate: Date;

  @Prop({ required: true })
  declare startTime: string; // "14:00"

  @Prop({
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  declare status: string;

  @Prop()
  declare specialRequests?: string;

  @Prop({ type: Number })
  declare totalPrice?: number;
}

const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ appointmentDate: 1, service: 1 });

export { BookingSchema };

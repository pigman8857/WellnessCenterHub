import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Address, AddressSchema } from './address.schema';
import { EmergencyContact, EmergencyContactSchema } from './emergency-contact.schema';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  declare firstName: string;

  @Prop({ required: true })
  declare lastName: string;

  //unique: true already creates an index , no need for { index: true }
  @Prop({ required: true, unique: true, lowercase: true })
  declare email: string;

  @Prop()
  declare phone?: string;

  //Embedded sub-document
  //Why embed? An address belongs to one customer, is always read with them, and is never queried independently.
  @Prop({ type: AddressSchema })
  declare address?: Address;

  @Prop({ enum: ['local', 'international'], default: 'local' })
  declare customerType: string;

  //Embedded Array
  @Prop({ type: [String], default: [] })
  declare preferredLanguages: string[];

  @Prop({ type: Date })
  declare dateOfBirth?: Date;

  //array of embedded objects
  @Prop({ type: [EmergencyContactSchema], default: [] })
  declare emergencyContacts: EmergencyContact[];
}

const CustomerSchema = SchemaFactory.createForClass(Customer);
// CustomerSchema.index({ email: 1 }); // 1 = ascending

export { CustomerSchema };

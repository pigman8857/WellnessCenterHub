import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Address, AddressSchema } from './address.schema';
import { EmergencyContact, EmergencyContactSchema } from './emergency-contact.schema';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  phone: string;

  //Embedded sub-document
  //Why embed? An address belongs to one customer, is always read with them, and is never queried independently.
  @Prop({ type: AddressSchema })
  address: Address;

  @Prop({ enum: ['local', 'international'], default: 'local' })
  customerType: string;

  //Embedded Array
  @Prop({ type: [String], default: [] })
  preferredLanguages: string[];

  @Prop({ type: Date })
  dateOfBirth: Date;

  //array of embedded objects
  @Prop({ type: [EmergencyContactSchema], default: [] })
  emergencyContacts: EmergencyContact[];
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

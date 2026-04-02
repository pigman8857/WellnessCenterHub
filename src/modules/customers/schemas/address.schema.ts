import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';

// A separate class defines the shape of the embedded doc
//— no separate _id generated for the sub-document
@Schema({ _id: false })
export class Address {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  postalCode: string;

  @Prop({ required: true })
  country: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

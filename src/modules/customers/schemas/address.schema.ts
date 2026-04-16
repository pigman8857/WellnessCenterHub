import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';

// A separate class defines the shape of the embedded doc
//— no separate _id generated for the sub-document
@Schema({ _id: false })
export class Address {
  @Prop({ required: true })
  declare street: string;

  @Prop({ required: true })
  declare city: string;

  @Prop()
  declare postalCode?: string;

  @Prop({ required: true })
  declare country: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

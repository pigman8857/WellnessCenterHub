import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmergencyContact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  relationship: string;
}

export const EmergencyContactSchema = SchemaFactory.createForClass(EmergencyContact);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmergencyContact {
  @Prop({ required: true })
  declare name: string;

  @Prop({ required: true })
  declare phone: string;

  @Prop()
  declare relationship?: string;
}

export const EmergencyContactSchema = SchemaFactory.createForClass(EmergencyContact);

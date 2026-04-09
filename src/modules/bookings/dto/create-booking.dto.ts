import { IsDate, IsNotEmpty, IsString, IsOptional, IsMongoId, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsMongoId()
  @IsNotEmpty()
  customerId: string; //<< should this be string or mongoose.Schema.Types.ObjectId?

  @IsMongoId()
  @IsNotEmpty()
  serviceId: string; //<< should this be string or mongoose.Schema.Types.ObjectId?

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  appointmentDate: Date;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsOptional()
  @IsString()
  specialRequests: string;

  @IsOptional()
  @IsNumber()
  totalPrice: number;
}

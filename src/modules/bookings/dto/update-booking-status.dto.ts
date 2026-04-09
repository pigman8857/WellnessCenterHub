import { IsEnum } from 'class-validator';
import { BookingStatus } from '../type';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus, {
    message:
      'Booking status must be a valid enum value (pending, confirmed, in-progress, completed, cancelled)',
  })
  status: BookingStatus;
}

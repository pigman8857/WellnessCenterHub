import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schema';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  imports: [MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }])],
})
export class BookingsModule {}

import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticService } from './analytics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticService],
  imports: [MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }])],
})
export class AnalyticsModule {}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { Model, PipelineStage } from 'mongoose';
import { MonthlyRevenue } from './types';

@Injectable()
export class AnalyticService {
  constructor(@InjectModel(Booking.name) private bookingModel: Model<BookingDocument>) {}

  async getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          status: 'completed',
          appointmentDate: {
            $gte: new Date(`${year}-01-01`), //midnight on Jan 1  <start of year>,
            $lt: new Date(`${year + 1}-01-01`), // midnight on Jan 1 of the next year. Use $lt, not $lte because Jan 1 next year at 00:00:00 is not part of the range.
          },
        },
      },
      {
        $group: {
          _id: { $month: '$appointmentDate' },
          totalRevenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          month: '$_id',
          totalRevenue: 1,
          bookingCount: 1,
          _id: 0,
        },
      },
    ];
    return this.bookingModel.aggregate<MonthlyRevenue>(pipeline);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { Model, PipelineStage } from 'mongoose';
import { MonthlyRevenue } from './types';
import { Document } from 'mongodb';

@Injectable()
export class AnalyticService {
  constructor(@InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>) {}

  private getPipelineMonthlyRevenue(year: number): PipelineStage[] {
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

    return pipeline;
  }

  private getPipelineTopService(): PipelineStage[] {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          status: { $in: ['confirmed', 'completed'] },
        },
      },
      {
        $group: {
          _id: '$service',
          bookingCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          bookingCount: -1,
        },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: 'wellnessservices', // raw MongoDB collection name — lowercase plural, NOT the class name
          localField: '_id', // the grouped doc's _id IS the service ObjectId (from $group _id: '$service')
          foreignField: '_id', // match against _id on the wellnessservices side
          as: 'serviceDetails', // name of the array field added to the output
        },
      },
    ];

    return pipeline;
  }

  async getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]> {
    return await this.bookingModel.aggregate<MonthlyRevenue>(this.getPipelineMonthlyRevenue(year));
  }

  async getExplainMonthlyRevenue(year: number): Promise<Document> {
    return await this.bookingModel.collection
      .aggregate(this.getPipelineMonthlyRevenue(year))
      .explain('executionStats');
  }

  async getTopService(): Promise<any[]> {
    return await this.bookingModel.aggregate<any>(this.getPipelineTopService());
  }
}

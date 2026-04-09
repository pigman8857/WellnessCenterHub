import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { Model } from 'mongoose';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Injectable()
export class BookingsService {
  constructor(@InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>) {}

  private async isSlotAvailable(
    serviceId: string,
    date: Date,
    startTime: string,
  ): Promise<boolean> {
    const found = await this.bookingModel.findOne({
      service: serviceId,
      appointmentDate: date,
      startTime,
      status: { $nin: ['cancelled'] },
    });

    return !found;
  }

  async create(dto: CreateBookingDto): Promise<BookingDocument> {
    const { serviceId, appointmentDate, startTime, specialRequests, totalPrice } = dto;
    if (!(await this.isSlotAvailable(serviceId, appointmentDate, startTime))) {
      throw new ConflictException('This time slot is already booked');
    }

    const result = new this.bookingModel({
      customer: dto.customerId,
      service: dto.serviceId,
      appointmentDate,
      startTime,
      specialRequests,
      totalPrice,
    });
    return await result.save();
  }

  async findAll(page: number, limit: number): Promise<BookingDocument[]> {
    // Pagination + Population

    // Chain find() → sort() → skip() → limit() → populate() → populate()
    // 1. One query to fetch the matching bookings (with sort + pagination applied)
    // 2. One query to fetch the referenced customers
    // 3. One query to fetch the referenced services

    const result = await this.bookingModel
      .find() //For now, no filter — return all bookings. Later you might filter by status or customerId.
      .sort({ appointmentDate: 1 }) //Upcoming bookings first — ascending date order (1):
      // Page 1, limit 10 → skip 0, take 10
      // Page 2, limit 10 → skip 10, take 10
      // Page 3, limit 10 → skip 20, take 10
      // Formula: skip = (page - 1) * limit
      .skip((page - 1) * limit)
      .limit(limit)
      //Replace the stored ObjectIds with the actual documents, but only the fields the response needs:
      .populate('customer', 'firstName lastName email')
      .populate('service', 'name price durationMinutes')
      .exec();

    return result;
  }

  async findOne(id: string): Promise<BookingDocument> {
    const result = await this.bookingModel
      .findById(id)
      .populate('customer', 'firstName lastName email')
      .populate('service', 'name price durationMinutes')
      .exec();

    if (!result) throw new NotFoundException();

    return result;
  }

  async update(bookingId: string, dto: UpdateBookingStatusDto): Promise<BookingDocument> {
    const result = await this.bookingModel
      .findByIdAndUpdate(bookingId, { status: dto.status }, { returnDocument: 'after' })
      .exec();
    if (!result) throw new NotFoundException();
    return result;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookingModel.findByIdAndDelete(id);

    if (!result) throw new NotFoundException();
  }
}

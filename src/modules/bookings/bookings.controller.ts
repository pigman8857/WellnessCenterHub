import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseDatePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingDocument } from './schemas/booking.schema';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingsService) {}

  @Get()
  async findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<BookingDocument[]> {
    return await this.bookingService.findAll(page, limit);
  }

  // GET /bookings/by-date?date=2026-04-01&serviceId=<objectId>
  // GET /bookings/by-date?date=2026-04-01   ← serviceId optional, tests left-prefix rule
  @Get('by-date')
  async findByDateAndService(
    @Query('date', new ParseDatePipe()) date: Date,
    @Query('serviceId') serviceId?: string,
  ): Promise<BookingDocument[]> {
    // 1. parse date string → new Date(date)
    // 2. call service method, pass serviceId as-is (may be undefined)
    return await this.bookingService.findByDateAndService(date, serviceId);
  }

  // GET /bookings/explain?date=2026-04-01&serviceId=<objectId>
  @Get('by-date/explain')
  async explainIndex(
    @Query('date', new ParseDatePipe()) date: Date,
    @Query('serviceId') serviceId?: string,
  ) {
    // same as above but calls explainFindByDateAndService
    return await this.bookingService.explainFindByDateAndService(date, serviceId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookingDocument> {
    return await this.bookingService.findOne(id);
  }

  @Post()
  async createBooking(@Body() dto: CreateBookingDto): Promise<BookingDocument> {
    return await this.bookingService.create(dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<BookingDocument> {
    return await this.bookingService.update(id, dto);
  }

  @Delete(':id')
  async deleteBooking(@Param('id') id: string): Promise<void> {
    return await this.bookingService.remove(id);
  }
}

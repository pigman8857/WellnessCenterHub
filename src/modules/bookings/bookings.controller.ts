import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

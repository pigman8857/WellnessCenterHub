import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseFloatPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceCategory } from './types';
import { ParseCategoryArrayPipe } from './pipes/parse-category-array.pipe';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async readAllServices(): Promise<ServiceDocument[]> {
    return await this.servicesService.findAll();
  }

  @Get('/inactive')
  async readInactiveService(): Promise<ServiceDocument[]> {
    return await this.servicesService.findInactive();
  }

  @Get('/no-active-field')
  async findNoIsActiveField(): Promise<ServiceDocument[]> {
    return await this.servicesService.findNoIsActiveField();
  }

  @Get('/filter/category')
  async findByCategory(
    @Query('category', new ParseEnumPipe(ServiceCategory)) category: ServiceCategory,
  ): Promise<ServiceDocument[]> {
    return await this.servicesService.findByCategory(category);
  }

  @Get('/filter/categories')
  async findByCategories(
    @Query('categories', ParseCategoryArrayPipe) categories: ServiceCategory[],
  ): Promise<ServiceDocument[]> {
    return await this.servicesService.findByCategories(categories);
  }

  @Get('filter/category/exclude')
  async findExcludingCategory(
    @Query('category', new ParseEnumPipe(ServiceCategory)) category: ServiceCategory,
  ): Promise<ServiceDocument[]> {
    return await this.servicesService.findExcludingCategory(category);
  }

  @Get('filter/price/range')
  async findByPriceRange(
    @Query('min', new ParseFloatPipe()) min: number,
    @Query('max', new ParseFloatPipe()) max: number,
  ): Promise<ServiceDocument[]> {
    return await this.servicesService.findByPriceRange(min, max);
  }

  @Get('filter/price/min')
  async findByMinPrice(
    @Query('min', new ParseFloatPipe()) min: number,
  ): Promise<ServiceDocument[]> {
    return await this.servicesService.findByMinPrice(min);
  }

  @Get(':id')
  async readOneService(@Param('id') id: string): Promise<ServiceDocument> {
    return await this.servicesService.findOne(id);
  }

  @Post()
  async createService(@Body() dto: CreateServiceDto): Promise<ServiceDocument> {
    return await this.servicesService.create(dto);
  }

  @Patch(':id')
  async updateService(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceDocument> {
    return await this.servicesService.update(id, dto);
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    return await this.servicesService.remove(id);
  }
}

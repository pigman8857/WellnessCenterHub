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

  // Option C — ParseArrayPipe + custom validation
  // NestJS has a built-in ParseArrayPipe that handles splitting and item-level transformation

  // @Get('/filter/categories')
  // async findByCategories(
  //   @Query(
  //     'categories',
  //     new ParseArrayPipe({
  //       items: String,       // each item in the array is a string
  //       separator: ',',      // split on comma
  //     }),
  //   )
  //   categories: string[],
  // ): Promise<ServiceDocument[]> {
  //   // At this point categories is already string[] — but NOT yet validated as ServiceCategory
  //   // ParseArrayPipe handles splitting; it does NOT validate enum membership
  //   // You still need to handle invalid values (Option A cast, or a guard/pipe below)
  //   return await this.servicesService.findByCategories(categories as ServiceCategory[]);
  // }

  // ParseArrayPipe gives you the split for free, but enum validation still needs a custom pipe:

  // // src/modules/services/pipes/parse-category-array.pipe.ts
  // import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
  // import { ServiceCategory } from '../types';

  // @Injectable()
  // export class ParseCategoryArrayPipe implements PipeTransform {
  //   transform(value: string): ServiceCategory[] {
  //     // value arrives as a raw comma-separated string from @Query
  //     const values = value.split(',').map((v) => v.trim());

  //     const valid = Object.values(ServiceCategory);
  //     const invalid = values.filter((v) => !valid.includes(v as ServiceCategory));

  //     // Reject the whole request if any value is not a valid enum member
  //     if (invalid.length > 0) {
  //       throw new BadRequestException(
  //         `Invalid categories: ${invalid.join(', ')}. Must be one of: ${valid.join(', ')}`,
  //       );
  //     }

  //     return values as ServiceCategory[];
  //   }
  // }

  // Then use it directly in the decorator:

  // @Get('/filter/categories')
  // async findByCategories(
  //   @Query('categories', ParseCategoryArrayPipe)   // ← pipe runs before the handler
  //   categories: ServiceCategory[],
  // ): Promise<ServiceDocument[]> {
  //   return await this.servicesService.findByCategories(categories);
  // }

  // ---
  // What this teaches:
  // - A PipeTransform sits between the raw HTTP request and your controller handler
  // - It either returns the transformed value or throws — nothing else
  // - BadRequestException becomes a 400 response automatically via NestJS's exception filter
  // - Pipes can be scoped to a single param (as here) or applied globally

  // ▎ Production note: For a real API you'd also add unit tests for the pipe itself — testing the happy path, the mixed valid/invalid case, and the all-invalid case. The pipe is pure logic
  // with no DB dependency, so it's trivial to test.
}

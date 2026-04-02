import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async readAllServices(): Promise<ServiceDocument[]> {
    return await this.servicesService.findAll();
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

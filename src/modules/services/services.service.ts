import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceDocument, WellnessService } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(WellnessService.name) private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async findAll(): Promise<ServiceDocument[]> {
    return await this.serviceModel.find().exec();
  }

  async findOne(id: string): Promise<ServiceDocument> {
    const result = await this.serviceModel.findById(id).exec();
    if (!result) throw new NotFoundException();
    return result;
  }

  async create(dto: CreateServiceDto): Promise<ServiceDocument> {
    //this.serviceModel.create(dto); is a short hand
    const newService = new this.serviceModel(dto);
    return await newService.save();
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceDocument> {
    const result = await this.serviceModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();

    if (!result) throw new NotFoundException();
    return result;
  }

  async remove(id: string): Promise<ServiceDocument> {
    const result = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException();
    return result;
  }
}

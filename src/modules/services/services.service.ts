import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceDocument, WellnessService } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceCategory } from './types';
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

  async findByCategory(category: string): Promise<ServiceDocument[]> {
    //Explicit form with $eq
    return await this.serviceModel.find({ category: { $eq: category } }).exec();
    //Implicit
    //return await this.serviceModel.find({ category }).exec();
  }

  async findExcludingCategory(category: string): Promise<ServiceDocument[]> {
    return await this.serviceModel.find({ category: { $ne: category } }).exec();
  }

  async findInactive(): Promise<ServiceDocument[]> {
    //direct
    //return this.serviceModel.find({ isActive: false}).exec();

    //$ne will also match if isActive field does not present
    //in a certain document as well

    return await this.serviceModel.find({ isActive: { $ne: true } }).exec();
  }

  //what if a document has no isActive field at all?
  async findNoIsActiveField(): Promise<ServiceDocument[]> {
    return await this.serviceModel.find({ isActive: { $exists: false } }).exec();
  }

  async findByMinPrice(minPrice: number): Promise<ServiceDocument[]> {
    return await this.serviceModel.find({ price: { $gte: minPrice } }).exec();
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<ServiceDocument[]> {
    return await this.serviceModel.find({ price: { $gte: minPrice, $lte: maxPrice } }).exec();
  }

  async findByCategories(categories: ServiceCategory[]): Promise<ServiceDocument[]> {
    return await this.serviceModel.find({ category: { $in: categories } }).exec();
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

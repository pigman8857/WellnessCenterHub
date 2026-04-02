import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CustomerDocument, Customer } from './schemas/customer.schema';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
  ) {}

  async findAll(): Promise<CustomerDocument[]> {
    return await this.customerModel.find().exec();
  }

  //Projection it only query with expecting fields, not all fields.
  async findAllWithOnlyNameAndEmail(): Promise<CustomerDocument[]> {
    return await this.customerModel
      .find({}, { firstName: 1, lastName: 1, email: 1, _id: 0 })
      .exec();
  }

  //Querying an Embedded Array
  async findAllByPreferredLanguage(preferredLanguages: string): Promise<CustomerDocument[]> {
    return await this.customerModel.find({ preferredLanguages }).exec();
  }

  //Querying an Embedded Array
  async findAlByWithinPreferredLanguages(preferredLanguage: string[]): Promise<CustomerDocument[]> {
    return await this.customerModel.find({ preferredLanguages: { $in: preferredLanguage } }).exec();
  }

  //Querying an Embedded Array
  async findAllByAllPreferredLanguages(preferredLanguages: string[]): Promise<CustomerDocument[]> {
    return await this.customerModel
      .find({ preferredLanguages: { $all: preferredLanguages } })
      .exec();
  }

  async findOne(id: string): Promise<CustomerDocument> {
    const result = await this.customerModel.findById(id).exec();
    if (!result) throw new NotFoundException();
    return result;
  }

  async create(dto: CreateCustomerDto): Promise<CustomerDocument> {
    const result = new this.customerModel(dto);
    return await result.save();
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<CustomerDocument> {
    const result = await this.customerModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();
    if (!result) throw new NotFoundException();
    return result;
  }

  async remove(id: string): Promise<CustomerDocument> {
    const result = await this.customerModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException();
    return result;
  }
}

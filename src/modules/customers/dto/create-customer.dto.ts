import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  ValidateNested,
  IsEnum,
  IsArray,
  IsString,
  IsDateString,
} from 'class-validator';
import { CustomerType } from '../type';

export class CreateAddressDto {
  @IsNotEmpty()
  street: string;

  @IsNotEmpty()
  city: string;

  @IsOptional()
  postalCode: string;

  @IsNotEmpty()
  country: string;
}

export class CreateEmergencyContact {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsString()
  relationship: string;
}

export class CreateCustomerDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @IsOptional()
  @IsEnum(CustomerType, { message: 'Category must be a valid enum value (local,international)' })
  customerType: CustomerType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredLanguages: string[];

  @IsOptional()
  @IsDateString()
  dateOfBirth: Date;

  @IsOptional()
  @IsArray()
  @Type(() => CreateEmergencyContact)
  @ValidateNested({ each: true })
  emergencyContacts: CreateEmergencyContact[];
}

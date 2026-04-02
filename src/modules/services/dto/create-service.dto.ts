import {
  IsString,
  Length,
  IsNotEmpty,
  IsInt,
  IsNumber,
  Min,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ServiceCategory } from '../types';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  description: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  price: number;

  @IsNotEmpty()
  @IsEnum(ServiceCategory, {
    message: 'Category must be a valid enum value (massage,meditation,herbal,beauty, retreat)',
  })
  category: ServiceCategory;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}

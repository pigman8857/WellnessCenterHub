import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { ServiceCategory } from '../types';

@Injectable()
export class ParseCategoryArrayPipe implements PipeTransform<string, ServiceCategory[]> {
  transform(value: string): ServiceCategory[] {
    if (!value) throw new BadRequestException('categories query param is required');

    // value arrives as a raw comma-separated string from @Query
    const values = value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    const valid = Object.values(ServiceCategory);
    const invalid = values.filter((v) => !valid.includes(v as ServiceCategory));

    // Reject the whole request if any value is not a valid enum member
    if (invalid.length > 0) {
      throw new BadRequestException(
        `Invalid categories: ${invalid.join(', ')}. Must be one of: ${valid.join(', ')}`,
      );
    }

    return values as ServiceCategory[];
  }
}

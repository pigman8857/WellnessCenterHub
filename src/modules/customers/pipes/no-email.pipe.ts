import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isEmail } from 'class-validator';

@Injectable()
export class ValidateEmailPipe implements PipeTransform {
  transform(value: string) {
    if (!value) throw new BadRequestException('email query param is required');

    if (!isEmail(value)) throw new BadRequestException('invalid email format');

    return value.toLowerCase();
  }
}

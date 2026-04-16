import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  SerializeOptions,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDocument } from './schemas/customer.schema';
import { CustomerSummaryDto } from './dto/customer-summary.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ValidateEmailPipe } from './pipes/no-email.pipe';
@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomersService) {}

  // POST /customers
  @Post()
  async create(@Body() dto: CreateCustomerDto): Promise<CustomerDocument> {
    return await this.customerService.create(dto);
  }

  // GET /customers
  @Get()
  async findAll(): Promise<CustomerDocument[]> {
    return await this.customerService.findAll();
  }

  @Get('/by-email')
  async findByEmail(@Query('email', ValidateEmailPipe) email: string): Promise<CustomerDocument> {
    return await this.customerService.findByEmail(email);
  }

  // GET /customers/explain/email?email=foo@bar.com
  @Get('explain/email')
  async explainByEmail(@Query('email', ValidateEmailPipe) email: string) {
    return this.customerService.explainFindByEmail(email);
  }

  // GET /customers/projection
  // @SerializeOptions is read by ClassSerializerInterceptor (registered globally in main.ts).
  // type: CustomerSummaryDto       → tells the interceptor which DTO class to map the response into.
  //                                  Internally it calls plainToInstance(CustomerSummaryDto, data).
  // excludeExtraneousValues: true  → strips any field NOT decorated with @Expose() in CustomerSummaryDto.
  //                                  Without this option, @Expose() is ignored and all fields pass through.

  // ClassSerializerInterceptor: automatically serializes every controller response using class-transformer.
  // It reads @SerializeOptions() metadata from the route handler, calls plainToInstance(DtoClass, data),
  // then applies @Expose() / @Exclude() rules before the response is sent.
  @UseInterceptors(ClassSerializerInterceptor) // ← scoped to this route only
  @SerializeOptions({ type: CustomerSummaryDto, excludeExtraneousValues: true })
  @Get('projection')
  async findAllWithProjection(): Promise<CustomerSummaryDto[]> {
    return this.customerService.findAllWithOnlyNameAndEmail();
  }

  //   GET /customers/language?lang=th
  @Get('language')
  async findAllByPreferredLanguage(@Query('lang') lang: string) {
    return await this.customerService.findAllByPreferredLanguage(lang);
  }

  //   GET /customers/language/any?langs=th,en
  @Get('language/any')
  async findAllByWithinPreferredLanguages(@Query('langs') langs: string) {
    return await this.customerService.findAllByWithinPreferredLanguages(langs.split(','));
  }

  @Get('language/all')
  async findByAllPreferredLanguages(@Query('langs') langs: string) {
    return await this.customerService.findAllByAllPreferredLanguages(langs.split(','));
  }

  //   GET /customers/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.customerService.findOne(id);
  }

  // PATCH /customers/:id
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return await this.customerService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.customerService.remove(id);
  }

  //Important ordering note: specific routes (language, projection) must be declared before the :id param route — otherwise NestJS will treat language as an id.
}

import { Controller } from '@nestjs/common';

@Controller('customers')
export class CustomersController {
  // 1. Imports: Controller, Get, Post, Patch, Delete, Body, Param, Query from '@nestjs/common'
  // 2. Import CustomersService, CreateCustomerDto, UpdateCustomerDto
  // @Controller('customers')
  // export class CustomersController {
  //   constructor(private readonly customersService: CustomersService) {}
  //   POST /customers
  //   @Post() → create(@Body() dto: CreateCustomerDto)
  //   GET /customers
  //   @Get() → findAll()
  //   GET /customers/projection
  //   @Get('projection') → findAllWithOnlyNameAndEmail()
  //   GET /customers/language?lang=th
  //   @Get('language') → findAllByPreferredLanguage(@Query('lang') lang: string)
  //   GET /customers/language/any?langs=th,en
  //   @Get('language/any') → findAlByWithinPreferredLanguages(@Query('langs') langs: string)
  //                          split langs on ',' before passing to service
  //   GET /customers/language/all?langs=th,en
  //   @Get('language/all') → findAllByAllPreferredLanguages(@Query('langs') langs: string)
  //                          split langs on ',' before passing to service
  //   GET /customers/:id
  //   @Get(':id') → findOne(@Param('id') id: string)
  //   PATCH /customers/:id
  //   @Patch(':id') → update(@Param('id') id: string, @Body() dto: UpdateCustomerDto)
  //   DELETE /customers/:id
  //   @Delete(':id') → remove(@Param('id') id: string)
  // }
  //Important ordering note: specific routes (language, projection) must be declared before the :id param route — otherwise NestJS will treat language as an id.
}

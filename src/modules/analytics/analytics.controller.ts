import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AnalyticService } from './analytics.service';
import { MonthlyRevenue } from './types';
import { Document } from 'mongodb';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticService: AnalyticService) {}

  @Get('monthly-revenue')
  async getMonthlyRevenue(
    @Query('year', new ParseIntPipe()) year: number,
  ): Promise<MonthlyRevenue[]> {
    return await this.analyticService.getMonthlyRevenue(year);
  }

  @Get('monthly-revenue/explain')
  async getExplainMonthlyRevenue(
    @Query('year', new ParseIntPipe()) year: number,
  ): Promise<Document> {
    return await this.analyticService.getExplainMonthlyRevenue(year);
  }
}

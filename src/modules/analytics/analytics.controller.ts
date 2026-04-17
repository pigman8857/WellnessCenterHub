import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AnalyticService } from './analytics.service';
import { MonthlyRevenue } from './types';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticService: AnalyticService) {}

  @Get('monthly-revenue')
  async getMonthlyRevenue(
    @Query('year', new ParseIntPipe()) year: number,
  ): Promise<MonthlyRevenue[]> {
    return await this.analyticService.getMonthlyRevenue(year);
  }
}

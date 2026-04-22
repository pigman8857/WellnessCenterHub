import { ServiceCategory } from '../services/types';

export interface MonthlyRevenue {
  month: number;
  totalRevenue: number;
  bookingCount: number;
}

export interface TopService {
  serviceName: string; //← comes from $lookup joining wellnessservices
  category: ServiceCategory; //← also from the joined service document
  bookingCount: number; //← comes from $group counting bookings
}

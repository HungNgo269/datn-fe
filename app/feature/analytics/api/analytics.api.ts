import { handleRequest } from "@/lib/handleApiRequest";
import { axiosClient } from "@/lib/api";

export enum AnalyticsPeriod {
  SEVEN_DAYS = "7d",
  THIRTY_DAYS = "30d",
  NINETY_DAYS = "90d",
}

export interface DateRangeDto {
  from: string;
  to: string;
}

export interface MetricWithGrowthDto {
  current: number;
  previous: number;
  growthRate: number;
}

export interface RevenueBreakdownDto {
  bookPurchases: number;
  subscriptions: number;
}

export interface DateRevenueDto {
  date: string;
  bookPurchases: number;
  subscriptions: number;
}

export interface DateUsersDto {
  date: string;
  newUsers: number;
}

export interface DateActiveUsersDto {
  date: string;
  activeUsers: number;
}

export interface DateViewsDto {
  date: string;
  views: number;
}

export interface AnalyticsResponseDto {
  period: string;
  dateRange: DateRangeDto;
  
  // Revenue
  revenue: MetricWithGrowthDto;
  revenueBreakdown: RevenueBreakdownDto;
  revenueByDate: DateRevenueDto[];
  
  // Active Users
  activeUsers?: MetricWithGrowthDto;
  activeUsersByDate?: DateActiveUsersDto[];
  
  // New Users
  newUsers: MetricWithGrowthDto;
  newUsersByDate: DateUsersDto[];
  
  // Views
  views: MetricWithGrowthDto;
  viewsByDate: DateViewsDto[];
}

export async function getAnalytics(period?: AnalyticsPeriod) {
  return handleRequest<AnalyticsResponseDto>(() =>
    axiosClient.get("/admin/analytics", {
      params: { period: period || AnalyticsPeriod.SEVEN_DAYS },
    })
  );
}

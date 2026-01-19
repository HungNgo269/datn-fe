import { handleRequest } from "@/lib/handleApiRequest";
import { axiosClient } from "@/lib/api";

export enum AnalyticsPeriod {
  SEVEN_DAYS = "7d",
  THIRTY_DAYS = "30d",
  NINETY_DAYS = "90d",
}

export interface DateRevenueDto {
  date: string;
  bookPurchases: number;
  subscriptions: number;
}

export interface RevenueBreakdownDto {
  bookPurchases: number;
  subscriptions: number;
}

export interface DateRangeDto {
  from: string;
  to: string;
}

export interface AnalyticsResponseDto {
  period: string;
  dateRange: DateRangeDto;
  current: number;
  previous: number;
  growthRate: number;
  breakdown: RevenueBreakdownDto;
  byDate: DateRevenueDto[];
}

export async function getAnalytics(period?: AnalyticsPeriod) {
  return handleRequest<AnalyticsResponseDto>(() =>
    axiosClient.get("/admin/analytics", {
      params: { period: period || AnalyticsPeriod.SEVEN_DAYS },
    })
  );
}

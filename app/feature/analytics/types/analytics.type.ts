import { LucideIcon } from "lucide-react";

export type TimeRange = "7days" | "30days" | "3months";

export interface AnalyticData {
  name: string;
  activeUsers: number;
  revenue: number;
  views: number;
  newUsers: number;
}

// Định nghĩa props cho StatCard
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  deltaPercent?: number;
  deltaLabel?: string;
}

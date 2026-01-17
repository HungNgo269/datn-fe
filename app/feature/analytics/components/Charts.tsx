"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { AnalyticData } from "../types/analytics.type";

interface ChartProps {
  data: AnalyticData[];
  tickInterval?: number; // How many ticks to skip between labels
}

interface RevenueBreakdownProps {
  bookSalesRevenue: number;
  subscriptionRevenue: number;
}

const formatCurrency = (val: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val
  );

const formatCompactCurrency = (val: number): string => {
  if (val >= 1000000000) {
    return `${(val / 1000000000).toFixed(1)}B`;
  }
  if (val >= 1000000) {
    return `${(val / 1000000).toFixed(1)}M`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1)}K`;
  }
  return val.toString();
};

export const RevenueChart: React.FC<ChartProps> = ({ data, tickInterval = 0 }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />
        <XAxis
          dataKey="name"
          fontSize={12}
          tick={{ fill: "#475569" }}
          axisLine={false}
          tickLine={false}
          interval={tickInterval}
        />
        <YAxis
          fontSize={12}
          tick={{ fill: "#475569" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: ValueType | undefined) => {
            const numericValue =
              typeof value === "number" ? value : Number(value || 0);
            return [formatCurrency(numericValue), "Revenue"];
          }}
          contentStyle={{
            backgroundColor: "#ffffff",
            color: "#0f172a",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#6366f1"
          fill="url(#colorRevenue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Colors: Amber for book sales, Teal for subscriptions (distinct from main purple chart)
const BREAKDOWN_COLORS = ["#f59e0b", "#14b8a6"];

export const RevenueBreakdownChart: React.FC<RevenueBreakdownProps> = ({
  bookSalesRevenue,
  subscriptionRevenue,
}) => {
  const total = bookSalesRevenue + subscriptionRevenue;
  const data = [
    { name: "Bán sách", value: bookSalesRevenue, color: BREAKDOWN_COLORS[0] },
    { name: "Gói hội viên", value: subscriptionRevenue, color: BREAKDOWN_COLORS[1] },
  ];

  const bookPercent = total > 0 ? Math.round((bookSalesRevenue / total) * 100) : 0;
  const subPercent = total > 0 ? Math.round((subscriptionRevenue / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="relative w-full h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: ValueType | undefined) => {
                const numericValue =
                  typeof value === "number" ? value : Number(value || 0);
                return formatCurrency(numericValue);
              }}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                fontSize: "12px",
                zIndex: 30,
                position: "relative",
              }}
              wrapperStyle={{
                zIndex: 30,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-muted-foreground">Tổng</span>
          <span className="text-sm font-semibold">{formatCompactCurrency(total)}</span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-col gap-1.5 mt-2 w-full px-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BREAKDOWN_COLORS[0] }} />
            <span className="text-muted-foreground">Bán sách</span>
          </div>
          <span className="font-medium">{bookPercent}%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BREAKDOWN_COLORS[1] }} />
            <span className="text-muted-foreground">Gói hội viên</span>
          </div>
          <span className="font-medium">{subPercent}%</span>
        </div>
      </div>
    </div>
  );
};

export const ActiveUsersChart: React.FC<ChartProps> = ({ data, tickInterval = 0 }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="#0ea5e9"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="#0ea5e9"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />
        <XAxis
          dataKey="name"
          fontSize={12}
          tick={{ fill: "#475569" }}
          axisLine={false}
          tickLine={false}
          interval={tickInterval}
        />
        <YAxis
          fontSize={12}
          tick={{ fill: "#475569" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: ValueType | undefined) => {
            const numericValue = Array.isArray(value)
              ? value[0] ?? 0
              : typeof value === "number"
                ? value
                : Number(value || 0);
            return [numericValue.toLocaleString("en-US"), "Count"];
          }}
          contentStyle={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        />
        <Area
          type="monotone"
          dataKey="activeUsers"
          name="Active Users"
          stroke="#0ea5e9"
          fill="url(#colorUsers)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const ViewsChart: React.FC<ChartProps> = ({ data, tickInterval = 0 }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />
        <XAxis
          dataKey="name"
          fontSize={12}
          tick={{ fill: "#475569" }}
          axisLine={false}
          tickLine={false}
          interval={tickInterval}
        />
        <YAxis
          fontSize={12}
          tick={{ fill: "#475569" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: ValueType | undefined) => {
            const numericValue = Array.isArray(value)
              ? value[0] ?? 0
              : typeof value === "number"
                ? value
                : Number(value || 0);
            return [numericValue.toLocaleString("en-US"), "Views"];
          }}
          contentStyle={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        />
        <Area
          type="monotone"
          dataKey="views"
          name="Views"
          stroke="#f59e0b"
          fill="url(#colorViews)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

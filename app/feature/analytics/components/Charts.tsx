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
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { AnalyticData } from "../types/analytics.type";

interface ChartProps {
  data: AnalyticData[];
}

const formatCurrency = (val: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val
  );

export const RevenueChart: React.FC<ChartProps> = ({ data }) => {
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

export const ActiveUsersChart: React.FC<ChartProps> = ({ data }) => {
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

export const ViewsChart: React.FC<ChartProps> = ({ data }) => {
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

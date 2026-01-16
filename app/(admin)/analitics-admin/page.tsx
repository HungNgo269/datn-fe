"use client";

import React, { useState, useMemo } from "react";
import { Users, DollarSign, Eye, UserPlus } from "lucide-react";
import {
  AnalyticData,
  TimeRange,
} from "@/app/feature/analytics/types/analytics.type";
import { StatCard } from "@/app/feature/analytics/components/StatCard";
import {
  RevenueChart,
  ActiveUsersChart,
  ViewsChart,
} from "@/app/feature/analytics/components/Charts";
import { getDeltaLabelVi } from "@/app/feature/analytics/helper/getDeltaLabel";

const ANALYTICS_DATA: Record<TimeRange, AnalyticData[]> = {
  day: [
    { name: "0h", activeUsers: 120, revenue: 1200000, views: 650, newUsers: 8 },
    { name: "1h", activeUsers: 110, revenue: 900000, views: 620, newUsers: 6 },
    { name: "2h", activeUsers: 105, revenue: 850000, views: 590, newUsers: 5 },
    { name: "3h", activeUsers: 98, revenue: 800000, views: 540, newUsers: 4 },
    { name: "4h", activeUsers: 95, revenue: 780000, views: 520, newUsers: 4 },
    { name: "5h", activeUsers: 110, revenue: 950000, views: 560, newUsers: 6 },
    { name: "6h", activeUsers: 150, revenue: 1500000, views: 720, newUsers: 9 },
    {
      name: "7h",
      activeUsers: 210,
      revenue: 2300000,
      views: 980,
      newUsers: 14,
    },
    {
      name: "8h",
      activeUsers: 260,
      revenue: 2800000,
      views: 1200,
      newUsers: 18,
    },
    {
      name: "9h",
      activeUsers: 310,
      revenue: 3400000,
      views: 1450,
      newUsers: 22,
    },
    {
      name: "10h",
      activeUsers: 360,
      revenue: 3900000,
      views: 1650,
      newUsers: 26,
    },
    {
      name: "11h",
      activeUsers: 400,
      revenue: 4300000,
      views: 1780,
      newUsers: 30,
    },
    {
      name: "12h",
      activeUsers: 420,
      revenue: 4600000,
      views: 1850,
      newUsers: 32,
    },
    {
      name: "13h",
      activeUsers: 410,
      revenue: 4550000,
      views: 1820,
      newUsers: 31,
    },
    {
      name: "14h",
      activeUsers: 380,
      revenue: 4200000,
      views: 1700,
      newUsers: 28,
    },
    {
      name: "15h",
      activeUsers: 370,
      revenue: 4100000,
      views: 1680,
      newUsers: 27,
    },
    {
      name: "16h",
      activeUsers: 390,
      revenue: 4250000,
      views: 1750,
      newUsers: 29,
    },
    {
      name: "17h",
      activeUsers: 430,
      revenue: 4700000,
      views: 1950,
      newUsers: 33,
    },
    {
      name: "18h",
      activeUsers: 460,
      revenue: 5000000,
      views: 2100,
      newUsers: 36,
    },
    {
      name: "19h",
      activeUsers: 440,
      revenue: 4800000,
      views: 2050,
      newUsers: 34,
    },
    {
      name: "20h",
      activeUsers: 400,
      revenue: 4400000,
      views: 1900,
      newUsers: 29,
    },
    {
      name: "21h",
      activeUsers: 320,
      revenue: 3600000,
      views: 1500,
      newUsers: 22,
    },
    {
      name: "22h",
      activeUsers: 240,
      revenue: 2800000,
      views: 1200,
      newUsers: 16,
    },
    {
      name: "23h",
      activeUsers: 170,
      revenue: 2000000,
      views: 900,
      newUsers: 10,
    },
  ],
  week: [
    {
      name: "Thứ 2",
      activeUsers: 520,
      revenue: 12000000,
      views: 4200,
      newUsers: 120,
    },
    {
      name: "Thứ 3",
      activeUsers: 560,
      revenue: 13500000,
      views: 4600,
      newUsers: 140,
    },
    {
      name: "Thứ 4",
      activeUsers: 610,
      revenue: 15000000,
      views: 5100,
      newUsers: 155,
    },
    {
      name: "Thứ 5",
      activeUsers: 590,
      revenue: 14200000,
      views: 4800,
      newUsers: 148,
    },
    {
      name: "Thứ 6",
      activeUsers: 650,
      revenue: 16500000,
      views: 5400,
      newUsers: 170,
    },
    {
      name: "Thứ 7",
      activeUsers: 720,
      revenue: 18200000,
      views: 6100,
      newUsers: 190,
    },
    {
      name: "Chủ nhật",
      activeUsers: 680,
      revenue: 17000000,
      views: 5600,
      newUsers: 175,
    },
  ],
  month: [
    {
      name: "1",
      activeUsers: 420,
      revenue: 9800000,
      views: 3600,
      newUsers: 110,
    },
    {
      name: "2",
      activeUsers: 440,
      revenue: 10200000,
      views: 3720,
      newUsers: 116,
    },
    {
      name: "3",
      activeUsers: 460,
      revenue: 10800000,
      views: 3900,
      newUsers: 122,
    },
    {
      name: "4",
      activeUsers: 480,
      revenue: 11200000,
      views: 4050,
      newUsers: 128,
    },
    {
      name: "5",
      activeUsers: 470,
      revenue: 11000000,
      views: 3980,
      newUsers: 125,
    },
    {
      name: "6",
      activeUsers: 500,
      revenue: 11800000,
      views: 4200,
      newUsers: 135,
    },
    {
      name: "7",
      activeUsers: 520,
      revenue: 12400000,
      views: 4380,
      newUsers: 142,
    },
    {
      name: "8",
      activeUsers: 540,
      revenue: 13000000,
      views: 4550,
      newUsers: 150,
    },
    {
      name: "9",
      activeUsers: 560,
      revenue: 13600000,
      views: 4720,
      newUsers: 158,
    },
    {
      name: "10",
      activeUsers: 580,
      revenue: 14200000,
      views: 4900,
      newUsers: 165,
    },
    {
      name: "11",
      activeUsers: 600,
      revenue: 14800000,
      views: 5050,
      newUsers: 172,
    },
    {
      name: "12",
      activeUsers: 620,
      revenue: 15400000,
      views: 5200,
      newUsers: 178,
    },
    {
      name: "13",
      activeUsers: 610,
      revenue: 15200000,
      views: 5150,
      newUsers: 175,
    },
    {
      name: "14",
      activeUsers: 590,
      revenue: 14600000,
      views: 5020,
      newUsers: 168,
    },
    {
      name: "15",
      activeUsers: 570,
      revenue: 14000000,
      views: 4880,
      newUsers: 162,
    },
    {
      name: "16",
      activeUsers: 600,
      revenue: 15000000,
      views: 5100,
      newUsers: 172,
    },
    {
      name: "17",
      activeUsers: 630,
      revenue: 16000000,
      views: 5280,
      newUsers: 180,
    },
    {
      name: "18",
      activeUsers: 650,
      revenue: 16600000,
      views: 5420,
      newUsers: 186,
    },
    {
      name: "19",
      activeUsers: 670,
      revenue: 17200000,
      views: 5560,
      newUsers: 192,
    },
    {
      name: "20",
      activeUsers: 690,
      revenue: 17800000,
      views: 5700,
      newUsers: 198,
    },
    {
      name: "21",
      activeUsers: 710,
      revenue: 18400000,
      views: 5900,
      newUsers: 205,
    },
    {
      name: "22",
      activeUsers: 730,
      revenue: 19000000,
      views: 6100,
      newUsers: 212,
    },
    {
      name: "23",
      activeUsers: 700,
      revenue: 18200000,
      views: 5850,
      newUsers: 204,
    },
    {
      name: "24",
      activeUsers: 680,
      revenue: 17600000,
      views: 5660,
      newUsers: 196,
    },
    {
      name: "25",
      activeUsers: 660,
      revenue: 17000000,
      views: 5480,
      newUsers: 188,
    },
    {
      name: "26",
      activeUsers: 640,
      revenue: 16400000,
      views: 5320,
      newUsers: 182,
    },
    {
      name: "27",
      activeUsers: 620,
      revenue: 15800000,
      views: 5180,
      newUsers: 176,
    },
    {
      name: "28",
      activeUsers: 600,
      revenue: 15200000,
      views: 5050,
      newUsers: 170,
    },
    {
      name: "29",
      activeUsers: 580,
      revenue: 14600000,
      views: 4920,
      newUsers: 164,
    },
    {
      name: "30",
      activeUsers: 560,
      revenue: 14000000,
      views: 4800,
      newUsers: 158,
    },
  ],
};

const calcTotals = (series: AnalyticData[]) =>
  series.reduce(
    (acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      views: acc.views + curr.views,
      newUsers: acc.newUsers + curr.newUsers,
      totalActive: acc.totalActive + curr.activeUsers,
    }),
    { revenue: 0, views: 0, newUsers: 0, totalActive: 0 }
  );

const calcDeltaPercent = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export default function AnalyticPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [chartType, setChartType] = useState<"active" | "views" | "revenue">(
    "active"
  );
  const data = useMemo(() => ANALYTICS_DATA[timeRange], [timeRange]);
  const deltaLabel = getDeltaLabelVi(timeRange);

  const summary = useMemo(() => {
    const totals = calcTotals(data);
    return {
      ...totals,
      avgActive: Math.round(totals.totalActive / data.length),
    };
  }, [data]);

  const previousSummary = useMemo(() => {
    const totals = calcTotals(data);
    return {
      revenue: Math.round(totals.revenue * 0.9),
      views: Math.round(totals.views * 1.05),
      newUsers: Math.round(totals.newUsers * 0.95),
      totalActive: Math.round(totals.totalActive * 1.02),
    };
  }, [data]);

  const revenueDelta = calcDeltaPercent(
    summary.revenue,
    previousSummary.revenue
  );
  const activeDelta = calcDeltaPercent(
    summary.avgActive,
    Math.round(previousSummary.totalActive / data.length)
  );
  const viewsDelta = calcDeltaPercent(summary.views, previousSummary.views);
  const newUsersDelta = calcDeltaPercent(
    summary.newUsers,
    previousSummary.newUsers
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 relative overflow-y-auto">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mt-3">
              Tổng quan phân tích
            </h1>
            <p className="text-slate-600 mt-2">
              Dữ liệu được cập nhật theo thời gian thực trên các chỉ số quan
              trọng
            </p>
          </div>

          <div className="flex bg-white/80 p-1 rounded-xl border border-slate-200 shadow-sm">
            {(["day", "week", "month"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors hover:cursor-pointer ${
                  timeRange === r
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {r === "day" ? "Ngày" : r === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Doanh thu"
            value={
              new Intl.NumberFormat("vi-VN").format(summary.revenue) + " VND"
            }
            icon={DollarSign}
            colorClass="bg-gradient-to-br from-emerald-500 to-teal-500"
            deltaPercent={revenueDelta}
            deltaLabel={deltaLabel}
          />
          <StatCard
            title="Người dùng hoạt động"
            value={summary.avgActive}
            icon={Users}
            colorClass="bg-gradient-to-br from-sky-500 to-indigo-500"
            deltaPercent={activeDelta}
            deltaLabel={deltaLabel}
          />
          <StatCard
            title="Lượt xem"
            value={summary.views.toLocaleString()}
            icon={Eye}
            colorClass="bg-gradient-to-br from-amber-500 to-orange-500"
            deltaPercent={viewsDelta}
            deltaLabel={deltaLabel}
          />
          <StatCard
            title="Người dùng mới"
            value={summary.newUsers}
            icon={UserPlus}
            colorClass="bg-gradient-to-br from-pink-500 to-rose-500"
            deltaPercent={newUsersDelta}
            deltaLabel={deltaLabel}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl border border-slate-200 shadow-sm shadow-indigo-100/60">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/20 rounded-full" />
                {chartType === "active"
                  ? "Thống kê người dùng hoạt động"
                  : chartType === "views"
                  ? "Xu hướng lượt xem"
                  : "Hiệu suất doanh thu"}
              </h3>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setChartType("active")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors hover:cursor-pointer ${
                    chartType === "active"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-white/70"
                  }`}
                >
                  Người dùng hoạt động
                </button>
                <button
                  onClick={() => setChartType("views")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors hover:cursor-pointer ${
                    chartType === "views"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-white/70"
                  }`}
                >
                  Lượt xem
                </button>
                <button
                  onClick={() => setChartType("revenue")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors hover:cursor-pointer ${
                    chartType === "revenue"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-white/70"
                  }`}
                >
                  Doanh thu
                </button>
              </div>
            </div>

            <div className="h-[350px]">
              {chartType === "active" ? (
                <ActiveUsersChart data={data} />
              ) : chartType === "views" ? (
                <ViewsChart data={data} />
              ) : (
                <RevenueChart data={data} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

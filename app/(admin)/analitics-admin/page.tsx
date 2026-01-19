// "use client";

// import React, { useState, useMemo, useEffect } from "react";
// import { Users, DollarSign, Eye, UserPlus, Loader2 } from "lucide-react";
// import {
//   AnalyticData,
//   TimeRange,
// } from "@/app/feature/analytics/types/analytics.type";
// import { StatCard } from "@/app/feature/analytics/components/StatCard";
// import {
//   RevenueChart,
//   RevenueBreakdownChart,
//   ActiveUsersChart,
//   ViewsChart,
// } from "@/app/feature/analytics/components/Charts";
// import { getDeltaLabelVi } from "@/app/feature/analytics/helper/getDeltaLabel";
// import { getAnalytics, AnalyticsPeriod } from "@/app/feature/analytics/api/analytics.api";
// import { toast } from "sonner";

// // Map frontend time range to backend period
// const TIME_RANGE_TO_PERIOD: Record<TimeRange, AnalyticsPeriod> = {
//   "7days": AnalyticsPeriod.SEVEN_DAYS,
//   "30days": AnalyticsPeriod.THIRTY_DAYS,
//   "3months": AnalyticsPeriod.NINETY_DAYS,
// };

// // Helper to generate daily mock data for users/views (until backend implements these)
// const generateMockUserViewData = (daysCount: number, startDate: Date): AnalyticData[] => {
//   const data: AnalyticData[] = [];
//   const months = ["thg 1", "thg 2", "thg 3", "thg 4", "thg 5", "thg 6", "thg 7", "thg 8", "thg 9", "thg 10", "thg 11", "thg 12"];
  
//   for (let i = 0; i < daysCount; i++) {
//     const date = new Date(startDate);
//     date.setDate(startDate.getDate() + i);
    
//     const day = date.getDate();
//     const month = months[date.getMonth()];
//     const name = `${day} ${month}`;
    
//     // Generate realistic looking data with some variation
//     const baseActive = 500 + Math.sin(i * 0.3) * 150 + Math.random() * 100;
//     const baseViews = 4500 + Math.sin(i * 0.35) * 1500 + Math.random() * 500;
//     const baseNewUsers = 120 + Math.sin(i * 0.28) * 40 + Math.random() * 20;
    
//     data.push({
//       name,
//       activeUsers: Math.round(baseActive),
//       revenue: 0, // Will be filled from API
//       views: Math.round(baseViews),
//       newUsers: Math.round(baseNewUsers),
//     });
//   }
//   return data;
// };

// // Tick interval for each time range (how many labels to skip)
// const TICK_INTERVALS: Record<TimeRange, number> = {
//   "7days": 0,    // Show all 7 days
//   "30days": 4,   // Show every 5th day (~6 labels)
//   "3months": 13, // Show every 14th day (~7 labels)
// };

// const calcTotals = (series: AnalyticData[]) =>
//   series.reduce(
//     (acc, curr) => ({
//       revenue: acc.revenue + curr.revenue,
//       views: acc.views + curr.views,
//       newUsers: acc.newUsers + curr.newUsers,
//       totalActive: acc.totalActive + curr.activeUsers,
//     }),
//     { revenue: 0, views: 0, newUsers: 0, totalActive: 0 }
//   );

// const calcDeltaPercent = (current: number, previous: number): number => {
//   if (previous === 0) return 0;
//   return ((current - previous) / previous) * 100;
// };

// export default function AnalyticPage() {
//   const [timeRange, setTimeRange] = useState<TimeRange>("30days");
//   const [chartType, setChartType] = useState<"active" | "views" | "revenue">(
//     "revenue"
//   );
//   const [isLoading, setIsLoading] = useState(true);
//   const [data, setData] = useState<AnalyticData[]>([]);
//   const [revenueBreakdown, setRevenueBreakdown] = useState({ bookSales: 0, subscription: 0 });
//   const [revenueDelta, setRevenueDelta] = useState(0);

//   const deltaLabel = getDeltaLabelVi(timeRange);

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       setIsLoading(true);
//       try {
//         const period = TIME_RANGE_TO_PERIOD[timeRange];
//         const analyticsData = await getAnalytics(period);

//         // Parse date range to generate mock user/view data
//         const fromDate = new Date(analyticsData.dateRange.from);
//         const toDate = new Date(analyticsData.dateRange.to);
//         const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

//         // Generate mock data for users/views
//         const mockData = generateMockUserViewData(daysDiff, fromDate);

//         // Merge real revenue data from API
//         const mergedData = mockData.map((item, index) => {
//           const apiDataPoint = analyticsData.byDate[index];
//           if (apiDataPoint) {
//             return {
//               ...item,
//               revenue: apiDataPoint.bookPurchases + apiDataPoint.subscriptions,
//             };
//           }
//           return item;
//         });

//         setData(mergedData);
//         setRevenueBreakdown({
//           bookSales: analyticsData.breakdown.bookPurchases,
//           subscription: analyticsData.breakdown.subscriptions,
//         });
//         setRevenueDelta(analyticsData.growthRate);
//       } catch (error) {
//         console.error("Failed to fetch analytics:", error);
//         toast.error("Không thể tải dữ liệu phân tích");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAnalytics();
//   }, [timeRange]);

//   const summary = useMemo(() => {
//     const totals = calcTotals(data);
//     return {
//       ...totals,
//       avgActive: Math.round(totals.totalActive / (data.length || 1)),
//     };
//   }, [data]);

//   const previousSummary = useMemo(() => {
//     const totals = calcTotals(data);
//     return {
//       revenue: Math.round(totals.revenue * 0.9),
//       views: Math.round(totals.views * 1.05),
//       newUsers: Math.round(totals.newUsers * 0.95),
//       totalActive: Math.round(totals.totalActive * 1.02),
//     };
//   }, [data]);

//   const activeDelta = calcDeltaPercent(
//     summary.avgActive,
//     Math.round(previousSummary.totalActive / (data.length || 1))
//   );
//   const viewsDelta = calcDeltaPercent(summary.views, previousSummary.views);
//   const newUsersDelta = calcDeltaPercent(
//     summary.newUsers,
//     previousSummary.newUsers
//   );

//   const timeRangeLabels: Record<TimeRange, string> = {
//     "7days": "7 ngày qua",
//     "30days": "30 ngày qua",
//     "3months": "3 tháng qua",
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
//           <p className="text-slate-600">Đang tải dữ liệu phân tích...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900 p-8 relative overflow-y-auto">
//       <div className="max-w-7xl mx-auto relative">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-slate-900 mt-3">
//               Tổng quan phân tích
//             </h1>
//             <p className="text-slate-600 mt-2">
//               Dữ liệu được cập nhật theo thời gian thực trên các chỉ số quan
//               trọng
//             </p>
//           </div>

//           <div className="flex bg-white/80 p-1 rounded-xl border border-slate-200 shadow-sm">
//             {(["7days", "30days", "3months"] as const).map((r) => (
//               <button
//                 key={r}
//                 onClick={() => setTimeRange(r)}
//                 className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors hover:cursor-pointer ${
//                   timeRange === r
//                     ? "bg-primary text-white shadow-sm"
//                     : "text-slate-700 hover:bg-slate-100"
//                 }`}
//               >
//                 {timeRangeLabels[r]}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//           <StatCard
//             title="Doanh thu"
//             value={
//               new Intl.NumberFormat("vi-VN").format(summary.revenue) + " VND"
//             }
//             icon={DollarSign}
//             colorClass="bg-gradient-to-br from-emerald-500 to-teal-500"
//             deltaPercent={revenueDelta}
//             deltaLabel={deltaLabel}
//           />
//           <StatCard
//             title="Người dùng hoạt động"
//             value={summary.avgActive}
//             icon={Users}
//             colorClass="bg-gradient-to-br from-sky-500 to-indigo-500"
//             deltaPercent={activeDelta}
//             deltaLabel={deltaLabel}
//           />
//           <StatCard
//             title="Lượt xem"
//             value={summary.views.toLocaleString()}
//             icon={Eye}
//             colorClass="bg-gradient-to-br from-amber-500 to-orange-500"
//             deltaPercent={viewsDelta}
//             deltaLabel={deltaLabel}
//           />
//           <StatCard
//             title="Người dùng mới"
//             value={summary.newUsers}
//             icon={UserPlus}
//             colorClass="bg-gradient-to-br from-pink-500 to-rose-500"
//             deltaPercent={newUsersDelta}
//             deltaLabel={deltaLabel}
//           />
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 gap-8">
//           <div className="bg-white/90 backdrop-blur p-6 rounded-2xl border border-slate-200 shadow-sm shadow-indigo-100/60">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//               <h3 className="text-lg font-bold flex items-center gap-2">
//                 <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/20 rounded-full" />
//                 {chartType === "active"
//                   ? "Thống kê người dùng hoạt động"
//                   : chartType === "views"
//                   ? "Xu hướng lượt xem"
//                   : "Hiệu suất doanh thu"}
//               </h3>

//               <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
//                 <button
//                   onClick={() => setChartType("active")}
//                   className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors hover:cursor-pointer ${
//                     chartType === "active"
//                       ? "bg-white text-slate-900 shadow-sm"
//                       : "text-slate-600 hover:bg-white/70"
//                   }`}
//                 >
//                   Người dùng hoạt động
//                 </button>
//                 <button
//                   onClick={() => setChartType("views")}
//                   className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors hover:cursor-pointer ${
//                     chartType === "views"
//                       ? "bg-white text-slate-900 shadow-sm"
//                       : "text-slate-600 hover:bg-white/70"
//                   }`}
//                 >
//                   Lượt xem
//                 </button>
//                 <button
//                   onClick={() => setChartType("revenue")}
//                   className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors hover:cursor-pointer ${
//                     chartType === "revenue"
//                       ? "bg-white text-slate-900 shadow-sm"
//                       : "text-slate-600 hover:bg-white/70"
//                   }`}
//                 >
//                   Doanh thu
//                 </button>
//               </div>
//             </div>

//             <div className="h-[350px]">
//               {chartType === "active" ? (
//                 <ActiveUsersChart data={data} tickInterval={TICK_INTERVALS[timeRange]} />
//               ) : chartType === "views" ? (
//                 <ViewsChart data={data} tickInterval={TICK_INTERVALS[timeRange]} />
//               ) : (
//                 <div className="flex h-full gap-6">
//                   {/* Main Revenue Chart */}
//                   <div className="flex-1 h-full">
//                     <RevenueChart data={data} tickInterval={TICK_INTERVALS[timeRange]} />
//                   </div>
//                   {/* Revenue Breakdown Donut Chart */}
//                   <div className="w-48 h-full flex flex-col bg-slate-50/50 rounded-xl border border-slate-200/80 p-3">
//                     <h4 className="text-sm font-semibold text-slate-700 mb-2 text-center">Nguồn doanh thu</h4>
//                     <div className="flex-1">
//                       <RevenueBreakdownChart
//                         bookSalesRevenue={revenueBreakdown.bookSales}
//                         subscriptionRevenue={revenueBreakdown.subscription}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
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
  RevenueBreakdownChart,
  ActiveUsersChart,
  ViewsChart,
} from "@/app/feature/analytics/components/Charts";
import { getDeltaLabelVi } from "@/app/feature/analytics/helper/getDeltaLabel";

// Helper to generate daily data points with Vietnamese date format
const generateDailyData = (daysCount: number, startDate: Date): AnalyticData[] => {
  const data: AnalyticData[] = [];
  const months = ["thg 1", "thg 2", "thg 3", "thg 4", "thg 5", "thg 6", "thg 7", "thg 8", "thg 9", "thg 10", "thg 11", "thg 12"];
  
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const name = `${day} ${month}`;
    
    // Generate realistic looking data with some variation
    const baseActive = 500 + Math.sin(i * 0.3) * 150 + Math.random() * 100;
    const baseRevenue = 12000000 + Math.sin(i * 0.25) * 4000000 + Math.random() * 2000000;
    const baseViews = 4500 + Math.sin(i * 0.35) * 1500 + Math.random() * 500;
    const baseNewUsers = 120 + Math.sin(i * 0.28) * 40 + Math.random() * 20;
    
    data.push({
      name,
      activeUsers: Math.round(baseActive),
      revenue: Math.round(baseRevenue),
      views: Math.round(baseViews),
      newUsers: Math.round(baseNewUsers),
    });
  }
  return data;
};

// Generate data for each time range
// Using January 17, 2026 as reference (current date based on context)
const today = new Date(2026, 0, 17); // Jan 17, 2026

const generate7DaysData = (): AnalyticData[] => {
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6); // 7 days ago
  return generateDailyData(7, startDate);
};

const generate30DaysData = (): AnalyticData[] => {
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 29); // 30 days ago
  return generateDailyData(30, startDate);
};

const generate3MonthsData = (): AnalyticData[] => {
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 89); // 90 days ago
  return generateDailyData(90, startDate);
};

const ANALYTICS_DATA: Record<TimeRange, AnalyticData[]> = {
  "7days": generate7DaysData(),
  "30days": generate30DaysData(),
  "3months": generate3MonthsData(),
};

// Tick interval for each time range (how many labels to skip)
const TICK_INTERVALS: Record<TimeRange, number> = {
  "7days": 0,    // Show all 7 days
  "30days": 4,   // Show every 5th day (~6 labels)
  "3months": 13, // Show every 14th day (~7 labels)
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

// Mock revenue breakdown (in real app, this would come from API)
const REVENUE_BREAKDOWN: Record<TimeRange, { bookSales: number; subscription: number }> = {
  "7days": { bookSales: 68000000, subscription: 38400000 },
  "30days": { bookSales: 320000000, subscription: 140000000 },
  "3months": { bookSales: 4200000000, subscription: 1800000000 },
};

const calcDeltaPercent = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export default function AnalyticPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
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

  const timeRangeLabels: Record<TimeRange, string> = {
    "7days": "7 ngày qua",
    "30days": "30 ngày qua",
    "3months": "3 tháng qua",
  };

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
            {(["7days", "30days", "3months"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors hover:cursor-pointer ${
                  timeRange === r
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {timeRangeLabels[r]}
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
                <ActiveUsersChart data={data} tickInterval={TICK_INTERVALS[timeRange]} />
              ) : chartType === "views" ? (
                <ViewsChart data={data} tickInterval={TICK_INTERVALS[timeRange]} />
              ) : (
                <div className="flex h-full gap-6">
                  {/* Main Revenue Chart */}
                  <div className="flex-1 h-full">
                    <RevenueChart data={data} tickInterval={TICK_INTERVALS[timeRange]} />
                  </div>
                  {/* Revenue Breakdown Donut Chart */}
                  <div className="w-48 h-full flex flex-col bg-slate-50/50 rounded-xl border border-slate-200/80 p-3">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 text-center">Nguồn doanh thu</h4>
                    <div className="flex-1">
                      <RevenueBreakdownChart
                        bookSalesRevenue={REVENUE_BREAKDOWN[timeRange].bookSales}
                        subscriptionRevenue={REVENUE_BREAKDOWN[timeRange].subscription}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type TimeFrame = "week" | "month";
export const DEFAULT_TIMEFRAME: TimeFrame = "month";

export function isTimeFrame(value: unknown): value is TimeFrame {
  return value === "week" || value === "month";
}

export function normalizeTimeFrame(
  value: unknown,
  fallback: TimeFrame = DEFAULT_TIMEFRAME
): TimeFrame {
  if (Array.isArray(value)) {
    return normalizeTimeFrame(value[0], fallback);
  }

  if (typeof value === "string" && isTimeFrame(value)) {
    return value;
  }

  return fallback;
}

export function getStartDate(timeframe: TimeFrame): Date {
  const now = new Date();

  switch (timeframe) {
    // case "Today":
    //   return new Date(now.getFullYear(), now.getmonth(), now.getDate());
    // "Sun Sep 07 2025 00:00:00 GMT+0700 (Indochina Time)" mà hình như node vẫn in ra utc ?
    case "week":
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return weekAgo;
    case "month":
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return monthStart;
    default:
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}

export const sortOptionsTime = [
  {
    id: 2,
    value: "week",
    label: "Tuần",
  },
  {
    id: 3,
    value: "month",
    label: "Tháng",
  },
];
export const sort_OPTIONS_time = [
  ...sortOptionsTime.map((options) => ({
    id: options.id,
    value: options.value,
    label: options.label,
  })),
];

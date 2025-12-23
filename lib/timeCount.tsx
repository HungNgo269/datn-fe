export type TimeFrame = "week" | "month";
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
  //   {
  //     id: 1,
  //     name: "Today",
  //   },
  {
    id: 2,
    name: "week",
  },
  {
    id: 3,
    name: "month",
  },
];
export const sort_OPTIONS_time = [
  ...sortOptionsTime.map((options) => ({
    id: options.id,
    name: options.name,
  })),
];

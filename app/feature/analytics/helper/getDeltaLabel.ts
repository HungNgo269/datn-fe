import { TimeRange } from "../types/analytics.type";

export const getDeltaLabelVi = (range: TimeRange) => {
  switch (range) {
    case "day":
      return "so với hôm qua";
    case "week":
      return "so với tuần trước";
    case "month":
      return "so với tháng trước";
    default:
      return "so với kỳ trước";
  }
};

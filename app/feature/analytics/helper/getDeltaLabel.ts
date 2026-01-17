import { TimeRange } from "../types/analytics.type";

export const getDeltaLabelVi = (range: TimeRange) => {
  switch (range) {
    case "7days":
      return "so với 7 ngày trước";
    case "30days":
      return "so với 30 ngày trước";
    case "3months":
      return "so với 3 tháng trước";
    default:
      return "so với kỳ trước";
  }
};

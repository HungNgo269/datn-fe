import { z } from "zod";
import { BannerPosition } from "../types/banner.types";

export const BannerSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề banner"),
  description: z.string(),
  linkUrl: z.string(),
  position: z.enum(BannerPosition),
  imageUrl: z.union([z.string(), z.instanceof(File)]).refine((val) => {
    if (!val) return false;
    if (typeof val === "string" && val.length > 0) return true;
    if (val instanceof File) return true;
    return false;
  }, "Vui lòng chọn ảnh banner"),
  startDate: z.string(),
  endDate: z.string(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export type BannerFormValues = z.infer<typeof BannerSchema>;

export interface BannerPayload extends Omit<BannerFormValues, "cover"> {
  id?: number;
  imageUrl: string;
}

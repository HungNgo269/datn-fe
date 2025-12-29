import { z } from "zod";
import { BannerPosition } from "../types/banner.types";

export const BannerSchema = z.object({
  title: z
    .string()
    .min(2, "Tiêu đề phải có ít nhất 2 ký tự")
    .max(150, "Tiêu đề tối đa 150 ký tự"),
  description: z
    .string()
    .max(500, "Mô tả tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  linkUrl: z
    .string("Liên kết không hợp lệ")
    .min(1)
    .optional()
    .or(z.literal("")),
  position: z.nativeEnum(BannerPosition).optional(),
  imageUrl: z.union([z.string().min(1), z.instanceof(File)]).refine((val) => {
    if (!val) return false;
    if (typeof val === "string" && val.length > 0) return true;
    if (val instanceof File) return true;
    return false;
  }, "Vui lòng chọn ảnh banner"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ")
    .optional()
    .or(z.literal("")),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ")
    .optional()
    .or(z.literal("")),
  order: z
    .union([z.number().int().min(0), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "string") {
        if (!val.trim()) return undefined;
        const parsed = Number(val);
        return Number.isNaN(parsed) ? undefined : parsed;
      }
      return val;
    }),
  isActive: z.boolean().optional().default(true),
});

export type BannerFormValues = z.infer<typeof BannerSchema>;

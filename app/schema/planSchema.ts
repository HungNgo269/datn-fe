import { z } from "zod";
import { SubscriptionPlan, BillingInterval } from "@/app/feature/plans/types/plans.types";

export const PlanSchema = z.object({
  plan: z.nativeEnum(SubscriptionPlan, {
    message: "Vui lòng chọn loại gói",
  }),
  name: z
    .string()
    .min(1, "Tên gói không được để trống")
    .max(100, "Tên gói không được quá 100 ký tự"),
  description: z
    .string()
    .max(500, "Mô tả không được quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  price: z
    .number({
      message: "Giá phải là số",
    })
    .min(0, "Giá không được âm"),
  currency: z.string().optional().default("vnd"),
  interval: z.nativeEnum(BillingInterval).optional().default(BillingInterval.MONTH),
  intervalCount: z.number().int().min(1).optional().default(1),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
});

export type PlanFields = z.infer<typeof PlanSchema>;

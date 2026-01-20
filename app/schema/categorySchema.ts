import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CategorySchema = z.object({
  name: z
    .string()
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(100, "Tên danh mục tối đa 100 ký tự"),
  slug: z
    .string()
    .min(2, "Slug tối thiểu 2 ký tự")
    .max(100, "Slug tối đa 100 ký tự")
    .regex(slugRegex, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
    .optional(),
  description: z
    .string()
    .max(500, "Mô tả tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  parentId: z
    .union([z.number().int().positive(), z.nan()])
    .optional()
    .transform((value) => (Number.isNaN(value) ? undefined : value)),
  isActive: z.boolean().optional().default(true),
});

export type CategoryFields = z.infer<typeof CategorySchema>;

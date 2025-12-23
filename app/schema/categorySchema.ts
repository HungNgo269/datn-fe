import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  description: z.string().optional(),
});

export type CategoryFields = z.infer<typeof CategorySchema>;

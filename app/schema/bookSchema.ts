import { z } from "zod";

export const BookSchema = z.object({
  title: z.string().min(1, "Tên sách không được để trống"),
  description: z.string().optional(),
  price: z
    .number()
    .min(0, "Giá phải lớn hơn hoặc bằng 0")
    .optional()
    .nullable(),
  freeChapters: z
    .number()
    .min(0, "Số chương miễn phí phải lớn hơn hoặc bằng 0")
    .optional()
    .nullable(),
  status: z.enum(["DRAFT", "PROCESSING", "PUBLISHED", "FAILED"]).optional(),
  authors: z.string().optional(),
  categories: z.string().optional(),
  slug: z.string().optional(),
});

export type BookFields = z.infer<typeof BookSchema>;

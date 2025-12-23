import { z } from "zod";

export const Step1Schema = z.object({
  title: z.string().min(1, "Điền tên sách"),
  slug: z.string().min(1, "Điền slug"),
  file: z.any().refine((file) => file instanceof File, "Chọn file sách"),
  cover: z.any().refine((file) => file instanceof File, "Chọn file ảnh"),
});

export const Step2Schema = z.object({
  authorIds: z.array(z.number().positive()).min(1, "Chọn/thêm tác giả"),
  categoryIds: z
    .array(z.number().positive())
    .min(1, "Phải chọn ít nhất một thể loại"),
  description: z.string().optional(),
  price: z.number().min(0),
  freeChapters: z.number().min(0),
});

export type Step1Data = z.infer<typeof Step1Schema>;
export type Step2Data = z.infer<typeof Step2Schema>;

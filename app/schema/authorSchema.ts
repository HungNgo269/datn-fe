import { z } from "zod";

export const AuthorSchema = z.object({
  name: z.string().min(1, "Tên tác giả không được để trống"),
  slug: z.string().min(1, "Đường dẫn không thể trống"),
  bio: z.string().optional(),
  avatar: z.any().refine((file) => file instanceof File, "Chọn file ảnh"),

  isActive: z.boolean().default(true).optional(),
});

export type AuthorFields = z.infer<typeof AuthorSchema>;

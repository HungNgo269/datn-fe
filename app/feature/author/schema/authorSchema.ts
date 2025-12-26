import { z } from "zod";

export const AuthorSchema = z.object({
  name: z.string().min(1, "Tên tác giả không được để trống"),
  slug: z.string().min(1, "Đường dẫn không thể trống").optional(),
  bio: z.string().optional(),
  avatar: z
    .union([z.instanceof(File), z.string(), z.null(), z.undefined()])
    .optional(),
  isActive: z.boolean().default(true).optional(),
});
export type AuthorFields = z.infer<typeof AuthorSchema>;
export type AuthorSubmitData = AuthorFields & {
  id?: number;
};

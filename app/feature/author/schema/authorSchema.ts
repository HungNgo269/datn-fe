import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const AuthorSchema = z.object({
  name: z
    .string()
    .min(2, "Tên tác giả phải có ít nhất 2 ký tự")
    .max(100, "Tên tác giả tối đa 100 ký tự"),
  slug: z
    .string()
    .min(2, "Slug tối thiểu 2 ký tự")
    .max(100, "Slug tối đa 100 ký tự")
    .regex(slugRegex, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
    .optional(),
  bio: z
    .string()
    .max(2000, "Tiểu sử tối đa 2000 ký tự")
    .optional()
    .or(z.literal("")),
  avatar: z
    .union([z.instanceof(File), z.string(), z.null(), z.undefined()])
    .optional(),
  isActive: z.boolean().default(true).optional(),
});
export type AuthorFields = z.infer<typeof AuthorSchema>;
export type AuthorSubmitData = AuthorFields & {
  id?: number;
};

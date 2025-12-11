import * as z from "zod";

export const RegisterSchema = z.object({
  username: z.string().min(3, "Tên tài khoản phải có ít nhất 3 ký tự"),
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
export type RegisterFields = z.infer<typeof RegisterSchema>;

import * as z from "zod";

export const ForgotPasswordSchema = z.object({
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
export type ForgotPasswordFields = z.infer<typeof ForgotPasswordSchema>;

import * as z from "zod";

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
});
export type ForgotPasswordFields = z.infer<typeof ForgotPasswordSchema>;

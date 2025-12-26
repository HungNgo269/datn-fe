import * as z from "zod";

export const ForgotPasswordSchema = z.object({
  email: z.email().min(1, "Hãy nhập email hợp lệ"),
});
export type ForgotPasswordFields = z.infer<typeof ForgotPasswordSchema>;

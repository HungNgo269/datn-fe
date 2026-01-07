import type { Metadata } from "next";
import ResetPasswordForm from "@/app/feature/auth/resetPassword/form/resetPasswordForm";

export const metadata: Metadata = { title: "Reset Password | NextBook" };

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}

import type { Metadata } from "next";
import ForgotPasswordForm from "@/app/feature/auth/forgotPassword/form/forgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password | NextBook" };

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}

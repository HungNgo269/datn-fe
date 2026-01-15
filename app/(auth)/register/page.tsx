import type { Metadata } from "next";
import RegisterForm from "@/app/feature/auth/register/registerForm";
import RegisterRedirectGuard from "@/app/feature/auth/register/registerRedirectGuard";

export const metadata: Metadata = { title: "Register | NextBook" };

export default function RegisterPage() {
  return (
    <RegisterRedirectGuard>
      <RegisterForm />
    </RegisterRedirectGuard>
  );
}

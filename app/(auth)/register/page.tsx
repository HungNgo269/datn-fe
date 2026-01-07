import type { Metadata } from "next";
import RegisterForm from "@/app/feature/auth/register/registerForm";

export const metadata: Metadata = { title: "Register | NextBook" };

export default function RegisterPage() {
  return <RegisterForm />;
}

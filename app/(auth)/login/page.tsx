import type { Metadata } from "next";
import LoginForm from "@/app/feature/auth/login/form/loginForm";

export const metadata: Metadata = { title: "Login | NextBook" };

export default function LoginPage() {
  return <LoginForm />;
}

import type { Metadata } from "next";
import LoginForm from "@/app/feature/auth/login/form/loginForm";
import LoginRedirectGuard from "@/app/feature/auth/login/form/loginRedirectGuard";

export const metadata: Metadata = { title: "Login | NextBook" };

export default function LoginPage() {
  return (
    <LoginRedirectGuard>
      <LoginForm />
    </LoginRedirectGuard>
  );
}

import type { Metadata } from "next";
import { ChangePasswordForm } from "@/app/feature/auth/changePassword/form/changePasswordForm";

export const metadata: Metadata = { title: "Privacy | NextBook" };

export default function AccountPrivacyPage() {
  return (
    <div className="rounded-2xl p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Riêng tư & Bảo mật
        </h2>
        <p className="text-sm text-muted-foreground">
          Bảo vệ tài khoản của bạn
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}

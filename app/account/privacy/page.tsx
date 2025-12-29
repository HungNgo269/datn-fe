import { ChangePasswordForm } from "@/app/feature/auth/changePassword/form/changePasswordForm";

export default function AccountPrivacyPage() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Privacy & Security
        </h2>
        <p className="text-sm text-muted-foreground">
          Update your password to keep your account secure.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}

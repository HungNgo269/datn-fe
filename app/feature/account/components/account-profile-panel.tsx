"use client";

import { ReactNode } from "react";
import { UserRound, Mail, ShieldCheck, Clock } from "lucide-react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { format } from "date-fns";

const formatDate = (value?: string) => {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return null;
  return format(timestamp, "dd/MM/yyyy");
};

export function AccountProfilePanel() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center space-y-4">
        <h2 className="text-2xl font-semibold">You&apos;re not logged in</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your profile, bookmarks, and privacy settings.
        </p>
      </div>
    );
  }

  const createdDate = formatDate(user.createdAt);
  const lastLogin = formatDate(user.lastLoginAt);

  return (
    <section className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Quản lý thông tin
        </h2>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin cá nhân của bạn và trạng thái tài khoản của bạn{" "}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ProfileItem
          icon={<UserRound className="h-5 w-5" />}
          label="Username"
          value={user.username}
        />
        <ProfileItem
          icon={<Mail className="h-5 w-5" />}
          label="Email"
          value={user.email}
        />
        <ProfileItem
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Subscription"
          value={user.subscriptionPlan || "Standard"}
        />
        <ProfileItem
          icon={<Clock className="h-5 w-5" />}
          label="Member since"
          value={createdDate || "N/A"}
        />
        <ProfileItem
          icon={<Clock className="h-5 w-5" />}
          label="Last login"
          value={lastLogin || "N/A"}
        />
        <ProfileItem
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Status"
          value={user.status || "Active"}
        />
      </div>
    </section>
  );
}

function ProfileItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-base font-medium text-foreground">
        {value || "—"}
      </p>
    </div>
  );
}

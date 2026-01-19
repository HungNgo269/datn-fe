"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { Clock, Mail, ShieldCheck, UserRound, CalendarDays, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formatDate = (value?: string) => {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return null;
  return format(timestamp, "dd/MM/yyyy");
};

export function AccountProfilePanel() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user) return null;

  const createdDate = useMemo(() => formatDate(user.createdAt), [user.createdAt]);
  const lastLogin = useMemo(() => formatDate(user.lastLoginAt), [user.lastLoginAt]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hồ sơ cá nhân</h2>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin định danh và bảo mật tài khoản của bạn.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserRound className="w-5 h-5 text-primary" />
              Thông tin cơ bản
            </CardTitle>
            <CardDescription>
              Thông tin hiển thị công khai của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileItem
              label="Tên hiển thị"
              value={user.username}
              icon={<UserRound className="w-4 h-4" />}
            />
            <ProfileItem
              label="Email"
              value={user.email}
              icon={<Mail className="w-4 h-4" />}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Trạng thái & Bảo mật
            </CardTitle>
            <CardDescription>
              Thông tin gói dịch vụ và hoạt động
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <KeyRound className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Gói hiện tại</span>
              </div>
              <Badge variant={user.subscriptionPlan === "FREE" ? "secondary" : "default"}>
                {user.subscriptionPlan || "Standard"}
              </Badge>
            </div>

            <ProfileItem
              label="Ngày tham gia"
              value={createdDate}
              icon={<CalendarDays className="w-4 h-4" />}
            />
            <ProfileItem
              label="Đăng nhập lần cuối"
              value={lastLogin}
              icon={<Clock className="w-4 h-4" />}
            />
          </CardContent>
        </Card>
      </div>
    </div>
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
    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 group hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-background border shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold truncate max-w-[150px] md:max-w-[200px]">
        {value || "--"}
      </span>
    </div>
  );
}

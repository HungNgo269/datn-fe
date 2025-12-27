"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChangePasswordFields,
  ChangePasswordSchema,
} from "@/app/schema/changePasswordSchema";
import { ChangePasswordRequest } from "../api/changePassword.api";
import { useAuthStore } from "@/app/store/useAuthStore";

export function ChangePasswordForm() {
  const user = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFields>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: ChangePasswordRequest,
    onSuccess: (data) => {
      toast.success(data?.message || "Đổi mật khẩu thành công.");
      reset();
    },
    onError: () => {
      toast.error("Không thể đổi mật khẩu. Vui lòng thử lại.");
    },
  });

  const onSubmit = (data: ChangePasswordFields) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để đổi mật khẩu.");
      return;
    }
    changePasswordMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center space-y-4">
        <Shield className="h-8 w-8 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-semibold">Đăng nhập để đổi mật khẩu</h2>
        <p className="text-sm text-muted-foreground">
          Tính năng này dành cho người dùng đã đăng nhập.
        </p>
      </div>
    );
  }

  const isPending = changePasswordMutation.isPending;

  return (
    <section className="rounded-2xl border bg-card p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Đổi mật khẩu</h2>
        <p className="text-sm text-muted-foreground">
          Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="currentPassword"
            type="password"
            placeholder="Mật khẩu hiện tại"
            disabled={isPending}
            {...register("currentPassword")}
            className={errors.currentPassword ? "border-destructive" : ""}
          />
          {errors.currentPassword && (
            <p className="text-sm text-destructive font-medium">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            id="newPassword"
            type="password"
            placeholder="Mật khẩu mới"
            disabled={isPending}
            {...register("newPassword")}
            className={errors.newPassword ? "border-destructive" : ""}
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive font-medium">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            disabled={isPending}
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {changePasswordMutation.isError && (
          <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Không thể đổi mật khẩu. Kiểm tra lại thông tin hoặc thử lại sau.
            </p>
          </div>
        )}

        <Button className="w-full" size="lg" disabled={isPending} type="submit">
          {isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang cập nhật...
            </div>
          ) : (
            "Lưu mật khẩu mới"
          )}
        </Button>
      </form>
    </section>
  );
}

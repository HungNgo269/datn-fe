"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChangePasswordFields,
  ChangePasswordSchema,
} from "@/app/schema/changePasswordSchema";
import { ChangePasswordRequest } from "../api/changePassword.api";
import { useAuthStore } from "@/app/store/useAuthStore";

export function ChangePasswordForm() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

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
      toast.success(data?.message || "Thay đổi mật khẩu thành công");
      reset();
    },
    onError: () => {
      toast.error("Không thể thay đổi mật khẩu");
    },
  });

  const onSubmit = (data: ChangePasswordFields) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để đổi mật khẩu");
      return;
    }
    changePasswordMutation.mutate(data);
  };

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user) return null;

  const isPending = changePasswordMutation.isPending;

  return (
    <section className="space-y-4 rounded-2xl p-6">
      <div>
        <h2 className="text-2xl font-semibold">Thay đổi mật khẩu</h2>
        <p className="text-sm text-muted-foreground">
          Cập nhật mật khẩu của bạn
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
            <p className="text-sm font-medium text-destructive">
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
            <p className="text-sm font-medium text-destructive">
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
            <p className="text-sm font-medium text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {changePasswordMutation.isError && (
          <div className="flex items-center space-x-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Không thể thay đổi mật khẩu, xin thử lại sau
            </p>
          </div>
        )}

        <Button className="w-full" size="lg" disabled={isPending} type="submit">
          {isPending ? (
            <div className="flex items-center justify-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              Đang cập nhật mật khẩu
            </div>
          ) : (
            "Xác nhận thay đổi"
          )}
        </Button>
      </form>
    </section>
  );
}

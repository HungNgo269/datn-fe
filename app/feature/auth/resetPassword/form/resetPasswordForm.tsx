"use client";

import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ResetPasswordFields,
  ResetPasswordSchema,
} from "@/app/schema/resetPasswordSchema";
import { ResetPassword } from "../api/resetPassword.api";

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordFields) =>
      ResetPassword({ token: token ?? "", newPassword: data.password }),
    onSuccess: (data) => {
      toast.success(data?.message || "Đặt lại mật khẩu thành công.");
      reset();
      router.push("/login");
    },
    onError: () => {
      toast.error("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Liên kết không hợp lệ hoặc đã hết hạn.");
    }
  }, [token]);

  const onSubmit = (data: ResetPasswordFields) => {
    if (!token) {
      toast.error("Token không hợp lệ.");
      return;
    }

    resetPasswordMutation.mutate(data);
  };

  const isPending = resetPasswordMutation.isPending;

  if (!token) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-4 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-bold">Liên kết không hợp lệ</h2>
          <p className="text-sm text-muted-foreground">
            Vui lòng yêu cầu đặt lại mật khẩu mới.
          </p>
          <Button asChild variant="secondary">
            <Link href="/forgotPassword">Gửi lại yêu cầu</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <header className="space-y-2 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h2 className="text-2xl font-bold">Đặt lại mật khẩu</h2>
          <p className="text-sm text-muted-foreground">
            Đặt mật khẩu mới cho tài khoản của bạn.
          </p>
        </header>

        <div className="mt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Mật khẩu mới"
                disabled={isPending}
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm font-medium text-destructive">
                  {errors.password.message}
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

            {resetPasswordMutation.isError && (
              <div className="flex items-center space-x-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  Không thể đặt lại mật khẩu. Vui lòng thử lại hoặc yêu cầu liên
                  kết mới.
                </p>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  Đang cập nhật...
                </div>
              ) : (
                "Cập nhật mật khẩu"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Nhớ mật khẩu?{" "}
            <Link
              href="/login"
              prefetch={false}
              className="font-medium text-primary hover:underline"
            >
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="min-h-[300px] w-full" />}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}

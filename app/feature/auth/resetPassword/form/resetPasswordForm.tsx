"use client";

import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResetPasswordFields,
  ResetPasswordSchema,
} from "@/app/schema/resetPasswordSchema";
import { ResetPassword } from "../api/resetPassword.api";
import Link from "next/link";

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
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-6 text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-bold">Liên kết không hợp lệ</h2>
          <p className="text-muted-foreground text-sm">
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
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <header className="space-y-2 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h2 className="text-2xl font-bold">Đặt lại mật khẩu</h2>
          <p className="text-muted-foreground text-sm">
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
                <p className="text-sm text-destructive font-medium">
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
                <p className="text-sm text-destructive font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {resetPasswordMutation.isError && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang cập nhật...
                </div>
              ) : (
                "Cập nhật mật khẩu"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Nhớ mật khẩu?{" "}
            <Link
              href="/login"
              prefetch={true}
              className="text-primary font-medium hover:underline"
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

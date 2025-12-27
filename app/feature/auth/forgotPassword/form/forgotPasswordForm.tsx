"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ForgotPasswordFields,
  ForgotPasswordSchema,
} from "@/app/schema/forgotPasswordSchema";
import { ForgotPassword } from "../api/forgotPassword.api";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: ForgotPassword,
    onSuccess: (data, variables) => {
      setSubmittedEmail(variables.email);
      toast.success(
        data?.message ||
          "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đổi mật khẩu."
      );
      reset();
    },
    onError: () => {
      toast.error("Không thể gửi yêu cầu. Vui lòng thử lại.");
    },
  });

  const onSubmit = (data: ForgotPasswordFields) => {
    forgotPasswordMutation.mutate(data);
  };

  const isPending = forgotPasswordMutation.isPending;

  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <header className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Quên mật khẩu</h2>
          <p className="text-muted-foreground text-sm">
            Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
          </p>
        </header>

        <div className="mt-6 space-y-4">
          {submittedEmail && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-left">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary">
                  Kiểm tra hộp thư của bạn
                </p>
                <p className="text-sm text-muted-foreground">
                  Nếu email <span className="font-medium">{submittedEmail}</span>{" "}
                  hợp lệ, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                disabled={isPending}
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {forgotPasswordMutation.isError && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  Không thể gửi yêu cầu. Thử lại sau ít phút.
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
                  Đang gửi yêu cầu...
                </div>
              ) : (
                "Gửi liên kết đặt lại"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Đã nhớ mật khẩu?{" "}
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

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ForgotPasswordFields,
  ForgotPasswordSchema,
} from "@/lib/validation/auth/forgotPasswordSchema";
import { ForgotPassword } from "../api/forgotPassword.api";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const ForgotPasswordMutation = useMutation({
    mutationFn: ForgotPassword,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Thay đổi mật khẩu thành công!");
      router.push("/login");
    },
    onError: (error) => {
      toast.error("Đã có lỗi xảy ra");
    },
  });

  const onSubmit = (data: ForgotPasswordFields) => {
    if (!token) {
      return;
    }
    ForgotPasswordMutation.mutate({
      ...data,
      token: token,
    });
  };

  const isPending = ForgotPasswordMutation.isPending;

  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <header className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">Đặt lại mật khẩu</h2>
          <p className="text-muted-foreground">Nhập mật khẩu mới của bạn</p>
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

            {ForgotPasswordMutation.isError && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  Thay đổi mật khẩu thất bại
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
                  Đang xử lý
                </div>
              ) : (
                "Xác nhận đổi mật khẩu"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

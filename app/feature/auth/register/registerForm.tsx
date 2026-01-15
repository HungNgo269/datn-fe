"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

import { RegisterFields, RegisterSchema } from "@/app/schema/registerSchema";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Register } from "./api/register.api";

export default function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(RegisterSchema),
  });

  const registerMutation = useMutation({
    mutationFn: Register,
    onSuccess: async (data) => {
      if (!data || !data.user || !data.accessToken) {
        throw new Error("Đăng nhập thất bại");
      }
      useAuthStore.getState().setUser(data.user);
      Cookies.set("accessToken", data.accessToken, {
        expires: 15 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      await queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Đăng ký thành công!");
      router.push("/");
      //Todo= làm 1 cái callbackurl
    },
  });

  const onSubmit = (data: RegisterFields) => {
    registerMutation.mutate(data);
  };

  const isPending = registerMutation.isPending;

  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <header className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">Đăng Ký Tài Khoản NextBook</h2>
          <p className="text-muted-foreground">
            Tạo tài khoản mới để bắt đầu sử dụng dịch vụ
          </p>
        </header>

        <div className="mt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="username"
                type="text"
                placeholder="Tên người dùng (Username)"
                autoFocus
                disabled={isPending}
                {...register("username")}
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username && (
                <p className="text-sm text-destructive font-medium">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Địa chỉ Email"
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

            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Mật khẩu"
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

            {registerMutation.isError && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  {registerMutation.error.message}
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
                  Đang đăng ký...
                </div>
              ) : (
                <div className="flex items-center justify-center hover:cursor-pointer">
                  Đăng ký Tài khoản
                </div>
              )}
            </Button>
          </form>

          <div className="pt-4">
            <Button variant="outline" className="w-full" type="button">
              Đăng ký bằng Google
            </Button>
          </div>

          <div className="pt-4"></div>
          <hr className="border-0.5 border-border" />

          <div className="text-center mt-4">
            <p className="text-muted-foreground text-sm">
              Đã có tài khoản?{" "}
              <Link
                prefetch={true}
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Bằng việc tiếp tục, bạn đồng ý với{" "}
              <Link
                href="/terms"
                className="underline hover:text-primary -foreground"
              >
                Điều khoản Dịch vụ
              </Link>{" "}
              và{" "}
              <Link
                href="/privacy"
                className="underline hover:text-primary -foreground"
              >
                Chính sách Bảo mật
              </Link>{" "}
              của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

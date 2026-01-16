"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { LoginFields, LoginSchema } from "@/app/schema/loginSchema";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Login } from "../api/login.api";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isSecureContext =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(LoginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: Login,
    onSuccess: async (data) => {
      if (!data || !data.user || !data.accessToken) {
        throw new Error("Đăng nhập thất bại");
      }
      useAuthStore.getState().setUser(data.user);

      await queryClient.invalidateQueries({ queryKey: ["user"] });

      Cookies.set("accessToken", data.accessToken, {
        expires: 15 * 60 * 1000,
        secure: isSecureContext,
        sameSite: "strict",
        path: "/",
      });
      toast.success("Đăng nhập thành công!");

      const redirectParam =
        searchParams.get("callbackUrl") ?? searchParams.get("next");
      const safeRedirect =
        redirectParam && redirectParam.startsWith("/") ? redirectParam : null;

      if (data.user.roles.includes("admin")) {
        router.push("/books-admin");
        return;
      }
      router.push(safeRedirect ?? "/");
    },
  });

  const onSubmit = (data: LoginFields) => {
    loginMutation.mutate(data);
  };

  const isPending = loginMutation.isPending;

  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <header className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">Đăng nhập vào NextBook</h2>
          <p className="text-muted-foreground">
            Nhập thông tin tài khoản của bạn để truy cập hệ thống.
          </p>
        </header>

        <div className="mt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Địa chỉ email"
                autoFocus
                disabled={isPending}
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm font-medium text-destructive">
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
                <p className="text-sm font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Button
                variant="link"
                type="button"
                className="h-auto p-0 text-sm text-muted-foreground hover:cursor-pointer"
                onClick={() => router.push("/forgotPassword")}
              >
                Quên mật khẩu?
              </Button>
            </div>

            {loginMutation.isError && (
              <div className="flex items-center space-x-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  Tên đăng nhập hoặc mật khẩu không chính xác
                </p>
              </div>
            )}

            <Button className="w-full" size="lg" disabled={isPending} type="submit">
              {isPending ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  Đang đăng nhập...
                </div>
              ) : (
                <div className="flex items-center justify-center hover:cursor-pointer">
                  Đăng nhập bằng Email
                </div>
              )}
            </Button>
          </form>

          <div className="pt-4">
            <Button variant="outline" className="w-full" type="button">
              Đăng nhập bằng Google
            </Button>
          </div>

          <div className="pt-4" />
          <hr className="border-0.5 border-border" />

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                prefetch={false}
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Tạo ngay bây giờ
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

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="min-h-[300px] w-full" />}>
      <LoginFormContent />
    </Suspense>
  );
}

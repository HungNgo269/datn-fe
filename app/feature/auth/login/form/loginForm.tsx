"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { LoginFields, LoginSchema } from "@/lib/validation/auth/loginSchema";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useTokenStore } from "@/app/store/useTokenStore";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Login } from "../api/login.api";

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      useTokenStore.getState().setToken(data.accessToken);

      await queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Đăng nhập thành công!");
      router.push("/books");
    },
  });

  const onSubmit = (data: LoginFields) => {
    loginMutation.mutate(data);
  };

  const isPending = loginMutation.isPending;

  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <header className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">Đăng Nhập Vào NextBook</h2>
          <p className="text-muted-foreground">
            Nhập thông tin tài khoản của bạn để truy cập
          </p>
        </header>

        <div className="mt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Địa chỉ Email"
                autoFocus
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

            <div className="flex items-center justify-end">
              <Button
                variant="link"
                type="button"
                className="text-sm p-0 h-auto hover:cursor-pointer text-muted-foreground"
                onClick={() => router.push("/forgotPassword")}
              >
                Quên mật khẩu?
              </Button>
            </div>

            {loginMutation.isError && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  Tên đăng nhập hoặc mật khẩu không chính xác
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

          <div className="pt-4"></div>
          <hr className="border-0.5 border-border" />

          <div className="text-center mt-4">
            <p className="text-muted-foreground text-sm">
              Chưa có tài khoản?{" "}
              <Link
                prefetch={true}
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Tạo ngay bây giờ
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Bằng việc tiếp tục, bạn đồng ý với{" "}
              <Link href="/terms" className="underline hover:text-primary">
                Điều khoản Dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="/privacy" className="underline hover:text-primary">
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

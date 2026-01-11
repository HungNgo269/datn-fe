"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChangePasswordFields,
  ChangePasswordSchema,
} from "@/app/schema/changePasswordSchema";
import { ChangePasswordRequest } from "../api/changePassword.api";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";

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
      toast.success(data?.message || "?? ?†i m ?-t kh ?cu thA?nh cA'ng.");
      reset();
    },
    onError: () => {
      toast.error("KhA'ng th ?? ?` ?†i m ?-t kh ?cu. Vui lA?ng th ?- l ??i.");
    },
  });

  const onSubmit = (data: ChangePasswordFields) => {
    if (!user) {
      toast.error("B ??n c ?Ωn ?`??ng nh ?-p ?` ?? ?` ?†i m ?-t kh ?cu.");
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
    <section className="rounded-2xl  p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">?? ?†i m ?-t kh ?cu</h2>
        <p className="text-sm text-muted-foreground">
          C ?-p nh ?-t m ?-t kh ?cu ?` ?? b ??o v ?? tA?i kho ??n c ?%a b ??n.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="currentPassword"
            type="password"
            placeholder="M ?-t kh ?cu hi ??n t ??i"
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
            placeholder="M ?-t kh ?cu m ?>i"
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
            placeholder="XA?c nh ?-n m ?-t kh ?cu m ?>i"
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
              KhA'ng th ?? ?` ?†i m ?-t kh ?cu. Ki ??m tra l ??i thA'ng tin ho ??c th ?- l ??i sau.
            </p>
          </div>
        )}

        <Button className="w-full" size="lg" disabled={isPending} type="submit">
          {isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ??ang c ?-p nh ?-t...
            </div>
          ) : (
            "L??u m ?-t kh ?cu m ?>i"
          )}
        </Button>
      </form>
    </section>
  );
}

"use client";

import { useAuthStore } from "@/app/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { LogOut } from "lucide-react";
import { logout } from "@/app/feature/auth/logout/api/logout.api";
import Cookies from "js-cookie";

export function LogOutButton() {
  const { handleSubmit } = useForm();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      useAuthStore.getState().clearUser();
      Cookies.remove("accessToken", { path: "/" });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Đăng xuất thành công!");
      // router.push("/books");
    },
  });

  const onSubmit = () => {
    logoutMutation.mutate();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Button
        type="submit"
        variant="ghost"
        className="hidden md:flex w-full justify-start gap-3 text-left text-destructive hover:text-destructive/90 hover:bg-destructive/10 "
      >
        <LogOut className="h-4 w-4" />
        Đăng xuất
      </Button>
    </form>
  );
}

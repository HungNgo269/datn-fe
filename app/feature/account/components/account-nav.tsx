"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getValidImageUrl } from "@/lib/utils";
import {
  User,
  Heart,
  Bookmark,
  ShieldCheck,
  CreditCard,
  LogOut,
  Wallet,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/app/feature/auth/logout/api/logout.api";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import Cookies from "js-cookie";

const NAV_LINKS = [
  {
    href: "/profile",
    label: "Quản lý tài khoản",
    icon: <User className="w-4 h-4" />,
  },
  {
    href: "/favourite-book",
    label: "Sách yêu thích",
    icon: <Heart className="w-4 h-4" />,
  },
  {
    href: "/bookmark",
    label: "Tủ sách cá nhân",
    icon: <Bookmark className="w-4 h-4" />,
  },

  {
    href: "/purchased",
    label: "Sách đã mua",
    icon: <ShoppingBag className="w-4 h-4" />,
  },

  {
    href: "/subscription-settings",
    label: "Hội viên",
    icon: <CreditCard className="w-4 h-4" />,
  },

  {
    href: "/privacy",
    label: "Quyền riêng tư",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
] as const;

export function AccountSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      useAuthStore.getState().clearUser();
      Cookies.remove("accessToken", { path: "/" });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.clear();
      window.location.reload();
      toast.success("Đăng xuất thành công!");
    },
  });

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={cn("flex flex-col h-full bg-background border rounded-xl overflow-hidden shadow-sm", className)}>
      <div className="p-6 border-b bg-muted/20">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-12 h-12 border-2 border-background ring-2 ring-primary/20">
            <AvatarImage 
              src={getValidImageUrl(user?.avatar || undefined) || "https://github.com/shadcn.png"} 
              alt={user?.username} 
            />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {getInitials(user?.username)}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <h3 className="font-bold text-base truncate" title={user?.username}>
              {user?.username}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                user?.subscriptionPlan === "FREE" 
                  ? "bg-muted text-muted-foreground" 
                  : "bg-primary/10 text-primary"
              )}>
                {user?.subscriptionPlan === "FREE" ? "Miễn phí" : "Hội viên"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
  
          {user?.subscriptionPlan === "FREE" ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-9 bg-background hover:bg-muted/50 font-medium"
              asChild
            >
              <Link href="/subscription">
                Nâng cấp
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-9 bg-primary/10 text-primary hover:bg-primary/20 font-medium border-primary/20"
              disabled
            >
              Hội viên
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_LINKS.map((link) => {
          const isActive =
            pathname === link.href ||
            (pathname?.startsWith(link.href) && link.href !== "/profile");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t bg-muted/20">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </Button>
      </div>
    </div>
  );
}

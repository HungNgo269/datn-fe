"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
import { Separator } from "@/components/ui/separator";

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
  const user = useAuthStore().user;
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-12 h-12 border-2 border-primary">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>USER</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-base">{user?.username}</h3>
            <p className="text-xs text-muted-foreground">
              {`${user?.subscriptionPlan === "FREE" ? "Miễn phí" : "Hội viên"}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            className="w-full text-xs h-8 bg-primary/90 hover:bg-primary"
          >
            <Wallet className="w-3 h-3 mr-1" /> Nạp thêm
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-8 border-primary/90 text-primary/90 hover:text-primary"
          >
            Hội viên
          </Button>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_LINKS.map((link) => {
          const isActive =
            pathname === link.href ||
            (pathname?.startsWith(link.href) && link.href !== "/profile");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center  gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground  hover:text-foreground hover:bg-primary/20"
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}

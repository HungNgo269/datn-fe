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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV_LINKS = [
  {
    href: "/account/profile",
    label: "Quản lý tài khoản",
    icon: <User className="w-4 h-4" />,
  },
  {
    href: "/account/favourite-book",
    label: "Sách yêu thích",
    icon: <Heart className="w-4 h-4" />,
  },
  {
    href: "/account/bookmark",
    label: "Tủ sách cá nhân",
    icon: <Bookmark className="w-4 h-4" />,
  },
  // {
  //   href: "/account/orders",
  //   label: "Quản lý đơn hàng",
  //   icon: <CreditCard className="w-4 h-4" />,
  // },
  {
    href: "/account/privacy",
    label: "Quyền riêng tư",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
] as const;

export function AccountSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      {/* 1. User Info Section - Giống trong ảnh */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-12 h-12 border-2 border-primary">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>USER</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-base">Ngô Hồ Minh Hưng</h3>
            <p className="text-xs text-muted-foreground">Thành viên thường</p>
          </div>
        </div>

        {/* Buttons giả lập giống ảnh */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            className="w-full text-xs h-8 bg-green-600 hover:bg-green-700"
          >
            <Wallet className="w-3 h-3 mr-1" /> Nạp xu
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-8 border-green-600 text-green-600 hover:text-green-700"
          >
            Hội viên
          </Button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_LINKS.map((link) => {
          const isActive =
            pathname === link.href ||
            (pathname?.startsWith(link.href) &&
              link.href !== "/account/profile");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}

"use client";

import type React from "react";

import { useCallback, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  Menu,
  GalleryHorizontal,
  UserPen,
  ChartBarStacked,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "../store/useAuthStore";
import { logout } from "../feature/auth/logout/api/logout.api";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    name: "Sách",
    icon: <BookOpen className="w-5 h-5" />,
    path: "/books-admin",
  },
  {
    name: "Thể loại",
    icon: <ChartBarStacked className="w-5 h-5" />,
    path: "/categories-admin",
  },
  {
    name: "Tác giả",
    icon: <UserPen className="w-5 h-5" />,
    path: "/authors-admin",
  },
  {
    name: "Banners",
    icon: <GalleryHorizontal className="w-5 h-5" />,
    path: "/banners-admin",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const activeItem = useMemo(() => {
    return (
      MENU_ITEMS.find((item) => pathname.startsWith(item.path)) ||
      MENU_ITEMS[0] ||
      null
    );
  }, [pathname]);
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      useAuthStore.getState().clearUser();
      Cookies.remove("accessToken", { path: "/" });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Đã đăng xuất tài khoản quản trị.");
      router.push("/login");
    },
    onError: () => {
      toast.error("Không thể đăng xuất. Thử lại sau.");
    },
  });

  const handleLogout = useCallback(() => {
    if (!logoutMutation.isPending) {
      logoutMutation.mutate();
    }
  }, [logoutMutation]);

  const handleChangePage = useCallback(
    (path: string) => {
      router.push(path);
      setMobileOpen(false);
    },
    [router]
  );

  return (
    <div className="flex h-screen bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black opacity-10 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {!collapsed && (
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Trang quản lý
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <ChevronLeft
              className={cn(
                "w-5 h-5 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {MENU_ITEMS.map((item) => (
            <Button
              key={item.name}
              variant={activeItem?.name === item.name ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 transition-all",
                collapsed ? "px-2" : "px-4",
                activeItem?.name === item.name &&
                  "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
              )}
              onClick={() => handleChangePage(item.path)}
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-destructive hover:text-destructive/90 hover:bg-destructive/10",
              collapsed ? "px-2" : "px-4"
            )}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Đăng xuất</span>}
          </Button>
          {!collapsed && (
            <div className="text-xs text-muted-foreground text-center">
              Admin v1.0.0
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center h-16 px-4 bg-card border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="ml-4 text-lg font-semibold text-foreground">
            {activeItem?.name}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-full mx-auto">
            <div className=" p-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

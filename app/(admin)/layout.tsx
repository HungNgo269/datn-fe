"use client";

import type React from "react";

import { useCallback, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronDown,
  Menu,
  GalleryHorizontal,
  UserPen,
  ChartBarStacked,
  LogOut,
  Layers,
  CreditCard,
  BadgePercent,
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

interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  children?: SubMenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    name: "Phân tích",
    icon: <ChartBarStacked className="w-5 h-5" />,
    path: "/analitics-admin",
  },
  {
    name: "Sách",
    icon: <BookOpen className="w-5 h-5" />,
    path: "/books-admin",
  },
  {
    name: "Thể loại",
    icon: <Layers className="w-5 h-5" />,
    path: "/categories-admin",
  },
  {
    name: "Tác giả",
    icon: <UserPen className="w-5 h-5" />,
    path: "/authors-admin",
  },
  {
    name: "Banner",
    icon: <GalleryHorizontal className="w-5 h-5" />,
    path: "/banners-admin",
  },
  {
    name: "Gói hội viên",
    icon: <CreditCard className="w-5 h-5" />,
    path: "/plans-admin",
  },
  {
    name: "Khuyến mãi",
    icon: <BadgePercent className="w-5 h-5" />,
    children: [
      { name: "Khuyến mãi sách", path: "/promotions-admin/books" },
      { name: "Khuyến mãi gói", path: "/promotions-admin/plans" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Khuyến mãi"]);
  const router = useRouter();
  const pathname = usePathname();
  
  const activeItem = useMemo(() => {
    // Check submenu items first
    for (const item of MENU_ITEMS) {
      if (item.children) {
        const matchedChild = item.children.find((child) => 
          pathname.startsWith(child.path)
        );
        if (matchedChild) return { ...matchedChild, parentName: item.name };
      }
      if (item.path && pathname.startsWith(item.path)) {
        return item;
      }
    }
    return MENU_ITEMS[0] || null;
  }, [pathname]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      useAuthStore.getState().clearUser();
      Cookies.remove("accessToken", { path: "/" });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Đã đăng xuất tài khoản quản trị.");
      router.push("/login");
      window.location.reload();
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

  const toggleExpanded = useCallback((menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  }, []);

  const isMenuActive = useCallback(
    (item: MenuItem) => {
      if (item.path) {
        return pathname.startsWith(item.path);
      }
      if (item.children) {
        return item.children.some((child) => pathname.startsWith(child.path));
      }
      return false;
    },
    [pathname]
  );

  const isSubMenuActive = useCallback(
    (path: string) => pathname.startsWith(path),
    [pathname]
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

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {MENU_ITEMS.map((item) => (
            <div key={item.name}>
              {/* Menu item with children (dropdown) */}
              {item.children ? (
                <div className="space-y-1">
                  <Button
                    variant={isMenuActive(item) ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-between gap-3 transition-all",
                      collapsed ? "px-2" : "px-4",
                      isMenuActive(item)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90"
                        : "hover:bg-sidebar-accent/50"
                    )}
                    onClick={() => toggleExpanded(item.name)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          expandedMenus.includes(item.name) && "rotate-180"
                        )}
                      />
                    )}
                  </Button>
                  
                  {/* Submenu items */}
                  {!collapsed && expandedMenus.includes(item.name) && (
                    <div className="ml-4 pl-4 border-l border-sidebar-border space-y-1">
                      {item.children.map((child) => (
                        <Button
                          key={child.path}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start gap-2 text-sm",
                            isSubMenuActive(child.path)
                              ? "text-sidebar-foreground font-bold"
                              : "text-sidebar-foreground font-medium hover:bg-sidebar-accent/50"
                          )}
                          onClick={() => handleChangePage(child.path)}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-colors",
                              isSubMenuActive(child.path)
                                ? "bg-primary"
                                : "bg-sidebar-foreground/40 group-hover:bg-sidebar-foreground"
                            )}
                          />
                          {child.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Regular menu item */
                <Button
                  variant={isMenuActive(item) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all",
                    collapsed ? "px-2" : "px-4",
                    isMenuActive(item)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90"
                      : "hover:bg-sidebar-accent/50"
                  )}
                  onClick={() => item.path && handleChangePage(item.path)}
                >
                  {item.icon}
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              )}
            </div>
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

      <div className="flex-1 flex flex-col overflow-y-auto">
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
        <div className="max-w-full">{children}</div>
      </div>
    </div>
  );
}


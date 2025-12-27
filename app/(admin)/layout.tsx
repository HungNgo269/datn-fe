"use client";

import type React from "react";

import { useState } from "react";
import {
  BookOpen,
  Users,
  ChevronLeft,
  Menu,
  GalleryHorizontal,
  UserPen,
  ChartBarStacked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter } from "next/navigation";
interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const listItems: MenuItem[] = [
    // {
    //   name: "Analytics",
    //   icon: <BarChart3 className="w-5 h-5" />,
    //   path: "/analytics-admin",
    // },
    {
      name: "Books",
      icon: <BookOpen className="w-5 h-5" />,
      path: "/books-admin",
    },

    {
      name: "Categories",
      icon: <ChartBarStacked className="w-5 h-5" />,
      path: "/categories-admin",
    },
    {
      name: "Authors",
      icon: <UserPen className="w-5 h-5" />,
      path: "/authors-admin",
    },
    {
      name: "Banners",
      icon: <GalleryHorizontal className="w-5 h-5" />,
      path: "/banners-admin",
    },

    {
      name: "Users",
      icon: <Users className="w-5 h-5" />,
      path: "/users-admin",
    },
  ];
  const userRole = useAuthStore.getState().user?.roles;
  if (!userRole?.includes("admin")) {
    //logout
  }
  const [active, setActive] = useState("Books");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const handleChangePage = (name: string) => {
    setActive(name);
    const currentActive = listItems.find((item: MenuItem) => {
      return item.name === name;
    });
    router.push(`${currentActive?.path}`);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-primary/50 z-40 lg:hidden"
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
              Admin Panel
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
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
          {listItems.map((item) => (
            <Button
              key={item.name}
              variant={active === item.name ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 transition-all",
                collapsed ? "px-2" : "px-4",
                active === item.name &&
                  "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
              )}
              onClick={() => handleChangePage(item.name)}
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
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
            {active}
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

"use client";

import { useState } from "react";
import { FavoriteBooksSection } from "@/app/feature/favorites/components/FavoriteBooksSection";
import { ChangePasswordForm } from "@/app/feature/auth/changePassword/form/changePasswordForm";
import { ReaderBookmarksSection } from "./readerBookmarksSection";
import { ReaderNotesSection } from "./readerNotesSection";
import { cn } from "@/lib/utils";

type AccountTab = "favorites" | "bookmarks" | "notes" | "password";

const tabs: Array<{
  id: AccountTab;
  title: string;
  description: string;
}> = [
  {
    id: "favorites",
    title: "Favourite Book",
    description: "Danh sách những cuốn sách bạn đã yêu thích.",
  },
  {
    id: "bookmarks",
    title: "Đánh dấu",
    description: "Những trang đã lưu lại trong quá trình đọc.",
  },
  {
    id: "notes",
    title: "Ghi chú",
    description: "Toàn bộ ghi chú cá nhân của bạn.",
  },
  {
    id: "password",
    title: "Đổi mật khẩu",
    description: "Tăng cường bảo mật tài khoản của bạn.",
  },
];

export function AccountContent() {
  const [activeTab, setActiveTab] = useState<AccountTab>("favorites");

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <aside className="rounded-2xl border bg-card p-4">
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <div className="font-semibold text-sm">{tab.title}</div>
                <p className="text-xs text-muted-foreground">
                  {tab.description}
                </p>
              </button>
            );
          })}
        </nav>
      </aside>

      {activeTab === "favorites" && <FavoriteBooksSection />}
      {activeTab === "bookmarks" && <ReaderBookmarksSection />}
      {activeTab === "notes" && <ReaderNotesSection />}
      {activeTab === "password" && <ChangePasswordForm />}
    </div>
  );
}

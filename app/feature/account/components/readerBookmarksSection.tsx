"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  ReaderBookmark,
  useReaderDataStore,
} from "@/app/store/useReaderDataStore";

export function ReaderBookmarksSection() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const bookmarks = useReaderDataStore((state) =>
    state.bookmarks.filter((bookmark) => bookmark.userId === userId)
  );
  const removeBookmark = useReaderDataStore((state) => state.removeBookmark);

  const sorted = useMemo(
    () =>
      [...bookmarks].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [bookmarks]
  );

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 min-h-[300px]">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Bookmark className="w-4 h-4" />
          Đánh dấu của tôi
        </p>
        <h2 className="text-2xl font-semibold text-foreground mt-1">
          Những trang bạn muốn quay lại
        </h2>
      </header>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Bạn chưa lưu đánh dấu nào. Dùng nút đánh dấu trong trình đọc để lưu
          trang quan trọng.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((bookmark) => (
            <BookmarkListItem
              key={bookmark.id}
              bookmark={bookmark}
              onRemove={removeBookmark}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function BookmarkListItem({
  bookmark,
  onRemove,
}: {
  bookmark: ReaderBookmark;
  onRemove: (id: string) => void;
}) {
  const href = bookmark.chapterSlug
    ? `/books/${bookmark.bookSlug}/chapter/${bookmark.chapterSlug}`
    : `/books/${bookmark.bookSlug}`;

  return (
    <li className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{bookmark.bookTitle}</p>
          <p className="text-xs text-muted-foreground">
            {bookmark.chapterTitle || "Chương chưa xác định"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(bookmark.id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Xoá đánh dấu"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Trang {bookmark.page}</span>
        {bookmark.createdAt && (
          <span>{format(new Date(bookmark.createdAt), "dd/MM/yyyy")}</span>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href={href}
          className="text-primary text-xs font-semibold hover:underline"
        >
          Đọc lại trang này
        </Link>
      </div>
    </li>
  );
}

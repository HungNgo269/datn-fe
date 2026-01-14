"use client";

import { useMemo, useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import BookmarkListItem from "./readerBookmarkListItem";

const getTimestamp = (value?: string) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export function ReaderBookmarksSection() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const bookmarks = useReaderDataStore((state) => state.bookmarks);
  const removeBookmark = useReaderDataStore((state) => state.removeBookmark);

  const userBookmarks = useMemo(() => {
    if (!userId) return [];
    return bookmarks.filter((bookmark) => bookmark.userId === userId);
  }, [bookmarks, userId]);

  const sorted = useMemo(
    () =>
      [...userBookmarks].sort(
        (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
      ),
    [userBookmarks]
  );
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const [page, setPage] = useState(1);
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => sorted.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage),
    [itemsPerPage, safePage, sorted]
  );

  return (
    <section className="rounded-2xl  p-6  space-y-4 min-h-[300px]">
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
          {pageItems.map((bookmark) => (
            <BookmarkListItem
              key={bookmark.id}
              bookmark={bookmark}
              onRemove={removeBookmark}
            />
          ))}
        </ul>
      )}
      {sorted.length > itemsPerPage && (
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() =>
              setPage((prev) => Math.max(1, Math.min(totalPages, prev - 1)))
            }
            disabled={safePage === 1}
            className="rounded-md border border-border px-2.5 py-1 text-foreground disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((prev) => Math.min(totalPages, Math.max(1, prev + 1)))
            }
            disabled={safePage === totalPages}
            className="rounded-md border border-border px-2.5 py-1 text-foreground disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  ReaderBookmark,
  useReaderDataStore,
} from "@/app/store/useReaderDataStore";

const getTimestamp = (value?: string) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const formatDateSafe = (value?: string) => {
  const time = getTimestamp(value);
  if (!time) return null;
  return format(time, "dd/MM/yyyy");
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
  const pageItems = useMemo(
    () => sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [page, itemsPerPage, sorted]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-md border border-border px-2.5 py-1 text-foreground disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded-md border border-border px-2.5 py-1 text-foreground disabled:opacity-50"
          >
            Next
          </button>
        </div>
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
        {formatDateSafe(bookmark.createdAt) && (
          <span>{formatDateSafe(bookmark.createdAt)}</span>
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

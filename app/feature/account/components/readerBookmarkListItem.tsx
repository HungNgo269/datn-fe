import { ReaderBookmark } from "@/app/types/book.types";
import { formatDate } from "@/lib/formatDate";
import { Link, Trash2 } from "lucide-react";

export default function BookmarkListItem({
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
        {formatDate(bookmark.createdAt) && (
          <span>{formatDate(bookmark.createdAt)}</span>
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

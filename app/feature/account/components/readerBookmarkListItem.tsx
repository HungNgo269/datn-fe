import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ReaderBookmark } from "@/app/types/book.types";
import { formatDate } from "@/lib/formatDate";

export default function BookmarkListItem({
  bookmark,
  onRemove,
}: {
  bookmark: ReaderBookmark;
  onRemove: (id: string) => void;
}) {
  const createdLabel = formatDate(bookmark.createdAt);
  const href = bookmark.chapterSlug
    ? `/books/${bookmark.bookSlug}/chapter/${bookmark.chapterSlug}`
    : `/books/${bookmark.bookSlug}`;

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm">
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
          className="text-muted-foreground transition-colors hover:text-destructive"
          aria-label="Xóa đánh dấu"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Trang {bookmark.page}</span>
        {createdLabel && <span>{createdLabel}</span>}
      </div>

      <div className="flex justify-end">
        <Link
          prefetch={false}
          href={href}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Đọc lại trang này
        </Link>
      </div>
    </li>
  );
}

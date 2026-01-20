"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StickyNote, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import type { ReaderNote } from "@/app/types/book.types";

const getTimestamp = (value?: string) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const formatDateSafe = (value?: string) => {
  const timestamp = getTimestamp(value);
  if (!timestamp) return null;
  return format(timestamp, "dd/MM/yyyy");
};

export function ReaderNotesSection() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const notes = useReaderDataStore((state) => state.notes);
  const removeNote = useReaderDataStore((state) => state.removeNote);

  const userNotes = useMemo(() => {
    if (!userId) return [];
    return notes.filter((note) => note.userId === userId);
  }, [notes, userId]);

  const sorted = useMemo(
    () =>
      [...userNotes].sort(
        (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
      ),
    [userNotes]
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
    <section className="min-h-[300px] space-y-4 rounded-2xl p-6">
      <header>
        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          <StickyNote className="h-4 w-4" />
          Ghi chú của tôi
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-foreground">
          Các đoạn văn bạn đã lưu lại
        </h2>
      </header>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Bạn chưa ghi chú đoạn nào. Chọn văn bản trong trình đọc và nhấn biểu
          tượng ghi chú để bắt đầu.
        </p>
      ) : (
        <ul className="space-y-3">
          {pageItems.map((note) => (
            <NoteListItem key={note.id} note={note} onRemove={removeNote} />
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
            Trước
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
            Sau
          </button>
        </div>
      )}
    </section>
  );
}

function NoteListItem({
  note,
  onRemove,
}: {
  note: ReaderNote;
  onRemove: (id: string) => void;
}) {
  const href = note.chapterSlug
    ? `/books/${note.bookSlug}/chapter/${note.chapterSlug}`
    : `/books/${note.bookSlug}`;
  const createdLabel = formatDateSafe(note.createdAt);

  return (
    <li className="space-y-2 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{note.bookTitle}</p>
          <p className="text-xs text-muted-foreground">
            {note.chapterTitle || "Chương chưa xác định"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(note.id)}
          className="text-muted-foreground transition-colors hover:text-destructive"
          aria-label="Xóa ghi chú"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {note.selectedText && (
        <p className="leading-relaxed text-muted-foreground italic">
          "{note.selectedText}"
        </p>
      )}
      <p className="leading-relaxed text-foreground">{note.note}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Trang {note.page}</span>
        {createdLabel && <span>{createdLabel}</span>}
      </div>

      <div className="flex justify-end">
        <Link
          prefetch={false}
          href={href}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Đọc lại đoạn này
        </Link>
      </div>
    </li>
  );
}

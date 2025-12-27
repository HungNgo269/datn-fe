"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StickyNote, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  ReaderNote,
  useReaderDataStore,
} from "@/app/store/useReaderDataStore";

export function ReaderNotesSection() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const notes = useReaderDataStore((state) =>
    state.notes.filter((note) => note.userId === userId)
  );
  const removeNote = useReaderDataStore((state) => state.removeNote);

  const sorted = useMemo(
    () =>
      [...notes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notes]
  );

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 min-h-[300px]">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          Ghi chú của tôi
        </p>
        <h2 className="text-2xl font-semibold text-foreground mt-1">
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
          {sorted.map((note) => (
            <NoteListItem key={note.id} note={note} onRemove={removeNote} />
          ))}
        </ul>
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

  return (
    <li className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm space-y-2">
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
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Xoá ghi chú"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <p className="italic text-muted-foreground leading-relaxed">
        “{note.selectedText}”
      </p>
      <p className="text-foreground leading-relaxed">{note.note}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Trang {note.page}</span>
        {note.createdAt && (
          <span>{format(new Date(note.createdAt), "dd/MM/yyyy")}</span>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href={href}
          className="text-primary text-xs font-semibold hover:underline"
        >
          Đọc lại đoạn này
        </Link>
      </div>
    </li>
  );
}

"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StickyNote, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  NoteColor,
  ReaderNote,
  useReaderDataStore,
} from "@/app/store/useReaderDataStore";

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

const NOTE_COLOR_CLASSES: Record<NoteColor, string> = {
  yellow: "border-l-4 border-yellow-400/80 bg-yellow-50/50",
  green: "border-l-4 border-green-400/80 bg-green-50/50",
  blue: "border-l-4 border-blue-400/80 bg-blue-50/50",
  pink: "border-l-4 border-pink-400/80 bg-pink-50/50",
  purple: "border-l-4 border-purple-400/80 bg-purple-50/50",
};

const getNoteColorClass = (color?: NoteColor) =>
  NOTE_COLOR_CLASSES[color ?? "yellow"];

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

  return (
    <section className="rounded-2xl  p-6  space-y-4 min-h-[300px]">
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
    <li
      className={`rounded-xl border border-border/70 p-4 text-sm space-y-2 ${getNoteColorClass(
        note.color
      )}`}
    >
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
        {formatDateSafe(note.createdAt) && (
          <span>{formatDateSafe(note.createdAt)}</span>
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

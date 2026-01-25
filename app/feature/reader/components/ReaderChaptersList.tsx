"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Bookmark, List, StickyNote, Trash2, X } from "lucide-react";
import { ChapterCardProps } from "@/app/feature/chapters/types/chapter.type";
import type {
  NoteColor,
  ReaderBookmark,
  ReaderNote,
} from "@/app/types/book.types";
import { NOTE_HIGHLIGHT_COLORS } from "../utils/readerHighlights";
import { useOutsideClick } from "@/lib/hooks/useOutsideClick";

interface ReaderChaptersListProps {
  chapters: ChapterCardProps[];
  currentChapterSlug?: string;
  currentPage: number;
  onClose: () => void;
  onChapterClick: (slug: string) => void;
  bookmarks?: ReaderBookmark[];
  notes?: ReaderNote[];
  onBookmarkSelect?: (bookmark: ReaderBookmark) => void;
  onNoteSelect?: (note: ReaderNote) => void;
  onRemoveBookmark?: (id: string) => void;
  onRemoveNote?: (id: string) => void;
}

const NOTE_COLOR_CLASSES: Record<NoteColor, string> = {
  yellow: "border-l-4 border-yellow-400/80 bg-yellow-400/20",
  green: "border-l-4 border-green-400/80 bg-green-400/20",
  blue: "border-l-4 border-blue-400/80 bg-blue-400/20",
  pink: "border-l-4 border-pink-400/80 bg-pink-400/20",
  purple: "border-l-4 border-purple-400/80 bg-purple-400/20",
};

const getNoteColorClass = (color?: NoteColor) =>
  NOTE_COLOR_CLASSES[color ?? "yellow"];

const getNoteHighlightStyle = (color?: NoteColor) => ({
  backgroundColor: NOTE_HIGHLIGHT_COLORS[color ?? "yellow"],
});

export default function ReaderChaptersList({
  chapters,
  currentChapterSlug,
  currentPage,
  onClose,
  onChapterClick,
  bookmarks = [],
  notes = [],
  onBookmarkSelect,
  onNoteSelect,
  onRemoveBookmark,
  onRemoveNote,
}: ReaderChaptersListProps) {
  const panelRef = useOutsideClick<HTMLDivElement>({
    enabled: chapters.length > 0,
    onOutside: onClose,
  });

  const sortedBookmarks = useMemo(() => {
    return [...bookmarks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [bookmarks]);

  const sortedNotes = useMemo(() => {
    return [...notes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notes]);

  if (chapters.length === 0) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-14 bottom-6 right-4 z-40 flex w-80 flex-col rounded-lg border border-border bg-popover shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <List className="h-4 w-4" /> Danh sách chương
        </h3>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => {
              onChapterClick(chapter.slug);
              onClose();
            }}
            className={`mb-1 w-full cursor-pointer rounded-md px-3 py-2 text-left transition-colors ${
              chapter.slug === currentChapterSlug
                ? "bg-primary font-medium text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <div className="text-sm">
              Chương {chapter.order}: {chapter.title}
            </div>
            {chapter.slug === currentChapterSlug && (
              <div className="mt-1 text-xs opacity-80">
                Đang đọc - Trang {currentPage}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="max-h-64 space-y-4 overflow-y-auto border-t border-border p-4">
        <section>
          <div className="flex items-center gap-2 text-[11px] uppercase text-muted-foreground">
            <Bookmark className="h-4 w-4" />
            Đánh dấu của bạn
          </div>
          <div className="mt-2 space-y-2">
            {sortedBookmarks.length > 0 ? (
              sortedBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="rounded-md border border-border/70 bg-muted/30 p-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <button
                      className="flex-1 cursor-pointer text-left font-medium text-foreground transition-colors hover:text-primary"
                      onClick={() => {
                        onBookmarkSelect?.(bookmark);
                        onClose();
                      }}
                    >
                      {bookmark.chapterTitle || "Chương chưa xác định"}
                    </button>
                    <button
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      onClick={() => onRemoveBookmark?.(bookmark.id)}
                      aria-label="Xóa đánh dấu"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-muted-foreground/80">
                    <span>Trang {bookmark.page}</span>
                    {bookmark.createdAt && (
                      <span>
                        {format(new Date(bookmark.createdAt), "dd/MM")}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground/70">
                Chưa có trang nào được đánh dấu.
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 text-[11px] uppercase text-muted-foreground">
            <StickyNote className="h-4 w-4" />
            Ghi chú
          </div>
          <div className="mt-2 space-y-2">
            {sortedNotes.length > 0 ? (
              sortedNotes.map((note) => (
                <div
                  key={note.id}
                  className={`space-y-1 rounded-md border border-border/70 p-2 text-xs ${getNoteColorClass(
                    note.color
                  )}`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      className="flex-1 cursor-pointer text-left font-medium text-foreground transition-colors hover:text-primary"
                      onClick={() => {
                        onNoteSelect?.(note);
                        onClose();
                      }}
                    >
                      {note.chapterTitle || "Chương chưa xác định"}
                    </button>
                    <button
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      onClick={() => onRemoveNote?.(note.id)}
                      aria-label="Xóa ghi chú"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="line-clamp-2 italic text-muted-foreground">
                    <span
                      className="rounded px-1"
                      style={getNoteHighlightStyle(note.color)}
                    >
                      “{note.selectedText}”
                    </span>
                  </p>
                  <p className="line-clamp-3 text-foreground">{note.note}</p>
                  <div className="flex items-center justify-between text-muted-foreground/80">
                    <span>Trang {note.page}</span>
                    {note.createdAt && (
                      <span>{format(new Date(note.createdAt), "dd/MM")}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground/70">
                Chưa có ghi chú nào.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

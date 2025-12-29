"use client";

import { List, X, Bookmark, StickyNote, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ChapterCardProps } from "@/app/feature/chapters/types/chapter.type";
import { ReaderBookmark, ReaderNote } from "@/app/store/useReaderDataStore";

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
  if (chapters.length === 0) return null;

  const sortedBookmarks = [...bookmarks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="absolute top-14 right-4 bottom-6 w-80 bg-popover border border-border rounded-lg shadow-xl z-40 flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <List className="w-4 h-4" /> Danh sách chương
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
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
            className={`w-full text-left px-3 py-2 rounded-md transition-colors mb-1 ${
              chapter.slug === currentChapterSlug
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <div className="text-sm">
              Chương {chapter.order}: {chapter.title}
            </div>
            {chapter.slug === currentChapterSlug && (
              <div className="text-xs mt-1 opacity-80">
                Đang đọc - Trang {currentPage}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="border-t border-border p-4 space-y-4 max-h-64 overflow-y-auto">
        <section>
          <div className="text-[11px] uppercase text-muted-foreground flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
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
                      className="flex-1 text-left font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => onBookmarkSelect?.(bookmark)}
                    >
                      {bookmark.chapterTitle || "Chương chưa xác định"}
                    </button>
                    <button
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => onRemoveBookmark?.(bookmark.id)}
                      aria-label="Xoá đánh dấu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
          <div className="text-[11px] uppercase text-muted-foreground flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            Ghi chú
          </div>
          <div className="mt-2 space-y-2">
            {sortedNotes.length > 0 ? (
              sortedNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-md border border-border/70 bg-muted/30 p-2 text-xs space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <button
                      className="flex-1 text-left font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => onNoteSelect?.(note)}
                    >
                      {note.chapterTitle || "Chương chưa xác định"}
                    </button>
                    <button
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => onRemoveNote?.(note.id)}
                      aria-label="Xoá ghi chú"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="italic text-muted-foreground line-clamp-2">
                    “{note.selectedText}”
                  </p>
                  <p className="text-foreground line-clamp-3">{note.note}</p>
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

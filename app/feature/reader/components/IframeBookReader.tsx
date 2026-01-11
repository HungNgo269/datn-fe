"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";

import ReaderFrame from "./ReaderFrame";

import ReaderSettings, { THEMES } from "./readerSetting";
import { ChapterCardProps } from "@/app/feature/chapters/types/chapter.type";
import ReaderTopBar from "./ReaderTopBar";
import ReaderPageNavigation from "./ReaderPageNavigation";
import ReaderChaptersList from "./ReaderChaptersList";
import ReaderNoteDialog from "./ReaderNoteDialog";
import { useReaderHtml } from "../hook/useReaderHTML";
import { useReaderPagination } from "../hook/useReaderPagination";
import { NoteColor, useReaderDataStore } from "@/app/store/useReaderDataStore";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "sonner";

const NOTE_HIGHLIGHT_COLORS: Record<NoteColor, string> = {
  yellow: "rgba(253, 224, 71, 0.6)",
  green: "rgba(134, 239, 172, 0.6)",
  blue: "rgba(147, 197, 253, 0.6)",
  pink: "rgba(249, 168, 212, 0.6)",
  purple: "rgba(196, 181, 253, 0.6)",
};

interface Props {
  initialHtml: string;
  title: string;
  bookSlug?: string;
  chapterSlug?: string;
  chapters?: ChapterCardProps[];
  currentChapterOrder?: number;
  nextChapterSlug?: string | null;
  bookTitle?: string;
  bookCoverImage?: string | null;
  bookId?: number | null;
}

export default function IframeBookReader({
  initialHtml,
  title,
  bookSlug,
  chapterSlug,
  chapters = [],
  nextChapterSlug,
  bookTitle,
  bookCoverImage,
  bookId,
}: Props) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const bookmarksStore = useReaderDataStore((state) => state.bookmarks);
  const notesStore = useReaderDataStore((state) => state.notes);
  const toggleBookmark = useReaderDataStore((state) => state.toggleBookmark);
  const addNoteToStore = useReaderDataStore((state) => state.addNote);
  const removeBookmarkFromStore = useReaderDataStore(
    (state) => state.removeBookmark
  );
  const removeNoteFromStore = useReaderDataStore((state) => state.removeNote);
  const updateContinueReading = useReaderDataStore(
    (state) => state.updateContinueReading
  );

  const [ready, setReady] = useState(false);
  const [openPanel, setOpenPanel] = useState<"settings" | "chapters" | null>(
    null
  );
  const fontSize = useReaderDataStore((state) => state.fontSize);
  const fontId = useReaderDataStore((state) => state.fontId);
  const themeId = useReaderDataStore((state) => state.themeId);
  const readMode = useReaderDataStore((state) => state.readMode);
  const setFontSize = useReaderDataStore((state) => state.setFontSize);
  const setFontId = useReaderDataStore((state) => state.setFontId);
  const setThemeId = useReaderDataStore((state) => state.setThemeId);
  const setReadMode = useReaderDataStore((state) => state.setReadMode);
  const [containerBg, setContainerBg] = useState("transparent");
  const [loading, setLoading] = useState(false);
  const fontsSnapshotRef = useRef({ fontId, fontSize, readMode });
  const hasCalculatedLayoutRef = useRef(false);
  const processedHtml = useReaderHtml({
    initialHtml,
    fontSize,
    fontId,
    themeId,
    readMode,
  });

  const positionKeyBase = `reading-pos-${bookSlug}-${chapterSlug}`;
  const {
    currentPage,
    totalPages,
    isPositionRestored,
    next,
    prev,
    goToPage,
    calculateTotalPages,
  } = useReaderPagination({
    iframeRef,
    storageKey:
      readMode === "paged" ? positionKeyBase : `${positionKeyBase}-scroll`,
    ready,
    readMode,
  });

  const [selectedText, setSelectedText] = useState("");
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const bookBookmarks = useMemo(() => {
    if (!bookSlug) return [];
    return bookmarksStore.filter(
      (bookmark) => bookmark.bookSlug === bookSlug && bookmark.userId === userId
    );
  }, [bookSlug, bookmarksStore, userId]);

  const bookNotes = useMemo(() => {
    if (!bookSlug) return [];
    return notesStore.filter(
      (note) => note.bookSlug === bookSlug && note.userId === userId
    );
  }, [bookSlug, notesStore, userId]);

  const applyNoteHighlights = useCallback(
    (doc: Document, notes: typeof bookNotes) => {
      const body = doc.body;
      if (!body) return;

      const existing = doc.querySelectorAll("mark[data-note-highlight]");
      existing.forEach((node) => {
        const parent = node.parentNode;
        if (!parent) return;
        parent.replaceChild(doc.createTextNode(node.textContent ?? ""), node);
        parent.normalize();
      });

      const highlightNote = (note: (typeof notes)[number]) => {
        const text = note.selectedText?.trim();
        if (!text) return;

        const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) {
              return NodeFilter.FILTER_REJECT;
            }
            const parent = (node as Text).parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (parent.closest("mark[data-note-highlight]")) {
              return NodeFilter.FILTER_REJECT;
            }
            const tag = parent.tagName;
            if (tag === "SCRIPT" || tag === "STYLE") {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        });

        while (walker.nextNode()) {
          const node = walker.currentNode as Text;
          const idx = node.nodeValue?.indexOf(text) ?? -1;
          if (idx === -1) continue;

          const range = doc.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + text.length);

          const mark = doc.createElement("mark");
          mark.setAttribute("data-note-highlight", "true");
          const color = note.color ?? "yellow";
          mark.setAttribute("data-color", color);
          mark.style.backgroundColor = NOTE_HIGHLIGHT_COLORS[color];
          mark.style.color = "inherit";
          mark.style.padding = "0 2px";
          mark.style.borderRadius = "2px";

          range.surroundContents(mark);
          break;
        }
      };

      notes.forEach(highlightNote);
    },
    []
  );

  useEffect(() => {
    if (!ready || !iframeRef.current?.contentDocument) return;
    applyNoteHighlights(iframeRef.current.contentDocument, bookNotes);
  }, [applyNoteHighlights, bookNotes, ready]);

  const getThemeColor = useCallback((varName: string) => {
    if (typeof window === "undefined") return "";
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  }, []);

  useEffect(() => {
    const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
    const bgColor = getThemeColor(theme.bgVar);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (bgColor) setContainerBg(bgColor);
  }, [themeId, getThemeColor]);

  const currentChapter = useMemo(() => {
    return chapters.find((chapter) => chapter.slug === chapterSlug);
  }, [chapters, chapterSlug]);
  const currentChapterTitle = currentChapter?.title ?? null;

  const currentChapterIndex = useMemo(() => {
    if (!chapterSlug || !chapters.length) return -1;
    return chapters.findIndex((chapter) => chapter.slug === chapterSlug);
  }, [chapterSlug, chapters]);

  const previousChapterSlug = useMemo(() => {
    if (currentChapterIndex > 0) {
      return chapters[currentChapterIndex - 1].slug;
    }
    return null;
  }, [chapters, currentChapterIndex]);

  const fallbackNextChapterSlug = useMemo(() => {
    if (currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1) {
      return chapters[currentChapterIndex + 1].slug;
    }
    return null;
  }, [chapters, currentChapterIndex]);

  const resolvedNextChapterSlug = nextChapterSlug ?? fallbackNextChapterSlug;

  const navigateToChapter = useCallback(
    (targetSlug: string | null | undefined) => {
      if (!bookSlug) return;
      if (targetSlug) {
        router.push(`/books/${bookSlug}/chapter/${targetSlug}`);
      } else {
        router.push(`/books/${bookSlug}`);
      }
    },
    [bookSlug, router]
  );

  const goToNextChapter = useCallback(() => {
    navigateToChapter(resolvedNextChapterSlug);
  }, [navigateToChapter, resolvedNextChapterSlug]);

  const goToPreviousChapter = useCallback(() => {
    navigateToChapter(previousChapterSlug);
  }, [navigateToChapter, previousChapterSlug]);

  const handleNextPage = useCallback(() => {
    const isLastPage = totalPages > 0 && currentPage >= totalPages;
    if (isLastPage) {
      goToNextChapter();
    } else {
      next();
    }
  }, [currentPage, goToNextChapter, next, totalPages]);

  const handlePreviousPage = useCallback(() => {
    const isFirstPage = currentPage <= 1;
    if (isFirstPage) {
      goToPreviousChapter();
    } else {
      prev();
    }
  }, [currentPage, goToPreviousChapter, prev]);

  const canNavigateForward =
    (totalPages > 0 && currentPage < totalPages) ||
    Boolean(resolvedNextChapterSlug || bookSlug);

  const canNavigateBackward =
    currentPage > 1 || Boolean(previousChapterSlug || bookSlug);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (readMode !== "paged") return;
      if (e.key === "ArrowRight") handleNextPage();
      if (e.key === "ArrowLeft") handlePreviousPage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNextPage, handlePreviousPage, readMode]);

  useEffect(() => {
    if (!ready || !iframeRef.current?.contentWindow) return;
    const handleSelection = () => {
      const selection = iframeRef.current?.contentWindow?.getSelection();
      setSelectedText(selection?.toString().trim() || "");
    };
    const doc = iframeRef.current.contentWindow.document;
    doc.addEventListener("mouseup", handleSelection);
    doc.addEventListener("keyup", handleSelection);
    return () => {
      doc.removeEventListener("mouseup", handleSelection);
      doc.removeEventListener("keyup", handleSelection);
    };
  }, [ready]);
  useEffect(() => {
    if (!ready || !isPositionRestored) return;

    const fontsChanged =
      fontsSnapshotRef.current.fontId !== fontId ||
      fontsSnapshotRef.current.fontSize !== fontSize ||
      fontsSnapshotRef.current.readMode !== readMode;

    fontsSnapshotRef.current = { fontId, fontSize, readMode };

    const shouldRecalculate = fontsChanged || !hasCalculatedLayoutRef.current;

    if (!shouldRecalculate) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    let cancelled = false;

    const timer = setTimeout(() => {
      const newTotal = calculateTotalPages();

      let targetPage = currentPage;
      if (targetPage > newTotal && newTotal > 0) {
        targetPage = newTotal;
      }

      if (!cancelled) {
        goToPage(targetPage);
        hasCalculatedLayoutRef.current = true;
        setLoading(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      setLoading(false);
    };
  }, [
    calculateTotalPages,
    currentPage,
    fontId,
    fontSize,
    goToPage,
    isPositionRestored,
    ready,
    readMode,
  ]);

  const handleIframeLoad = () => setReady(true);

  const handleBookmark = () => {
    if (!bookSlug) {
      return;
    }
    toggleBookmark({
      userId,
      bookId: bookId ?? null,
      bookSlug,
      bookTitle: bookTitle ?? title,
      bookCoverImage: bookCoverImage ?? null,
      chapterSlug: chapterSlug || null,
      chapterTitle: currentChapter?.title ?? null,
      page: currentPage,
    });
  };

  const saveNote = (noteText: string, color: NoteColor) => {
    if (!bookSlug || !selectedText || !noteText.trim()) {
      return;
    }
    addNoteToStore({
      userId,
      bookSlug,
      bookTitle: bookTitle ?? title,
      chapterSlug: chapterSlug || null,
      chapterTitle: currentChapter?.title ?? null,
      page: currentPage,
      selectedText,
      note: noteText.trim(),
      color,
      bookId: null,
    });
    setSelectedText("");
    setShowNoteDialog(false);
    iframeRef.current?.contentWindow?.getSelection()?.removeAllRanges();
  };

  const handleNoteClick = () => {
    if (selectedText) setShowNoteDialog(true);
    else toast.error("Vui lòng bôi đen văn bản để tạo ghi chú");
  };

  const isSettingsOpen = openPanel === "settings";
  const isChaptersOpen = openPanel === "chapters";

  const togglePanel = useCallback((panel: "settings" | "chapters") => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  }, []);

  const closePanels = useCallback(() => setOpenPanel(null), []);

  const showBlockingOverlay = loading || !ready || !isPositionRestored;

  const isBookmarked = bookBookmarks.some(
    (bookmark) =>
      bookmark.page === currentPage &&
      bookmark.chapterSlug === (chapterSlug || null)
  );

  useEffect(() => {
    if (!bookSlug) {
      return;
    }

    updateContinueReading({
      userId,
      bookId: bookId ?? null,
      bookSlug,
      bookTitle: bookTitle ?? title,
      bookCoverImage: bookCoverImage ?? null,
      chapterSlug: chapterSlug ?? null,
      chapterTitle: currentChapterTitle,
      page: currentPage,
    });
  }, [
    bookCoverImage,
    bookSlug,
    bookTitle,
    chapterSlug,
    currentChapterTitle,
    currentPage,
    title,
    updateContinueReading,
    userId,
  ]);

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-muted transition-colors duration-300">
      <ReaderTopBar
        title={title}
        currentPage={currentPage}
        totalPages={totalPages}
        themeBg={containerBg}
        onBackToBook={() => bookSlug && router.push(`/books/${bookSlug}`)}
        onNextChapter={goToNextChapter}
        nextChapterSlug={resolvedNextChapterSlug}
        onToggleSettings={() => togglePanel("settings")}
        onToggleChapters={() => togglePanel("chapters")}
        onToggleNotes={handleNoteClick}
        isBookmarked={isBookmarked}
        onToggleBookmark={handleBookmark}
        isSettingsOpen={isSettingsOpen}
        isChaptersOpen={isChaptersOpen}
      />

      <div className="flex-1 relative w-full h-full overflow-hidden">
        <ReaderFrame
          iframeRef={iframeRef}
          content={processedHtml}
          onLoad={handleIframeLoad}
          isReady={isPositionRestored}
          themeId={themeId}
          bgStyle={containerBg}
        />

        {readMode === "paged" && (
          <ReaderPageNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={handlePreviousPage}
            onNext={handleNextPage}
            canGoPrev={canNavigateBackward}
            canGoNext={canNavigateForward}
          />
        )}

        {showBlockingOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
            <div className="w-8 h-8 border-4 border-muted border-t-green-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <ReaderSettings
        isOpen={isSettingsOpen}
        onClose={closePanels}
        fontSize={fontSize}
        setFontSize={setFontSize}
        currentTheme={themeId}
        setTheme={setThemeId}
        currentFont={fontId}
        setFont={setFontId}
        readMode={readMode}
        setReadMode={setReadMode}
      />

      {isChaptersOpen && (
        <ReaderChaptersList
          chapters={chapters}
          currentChapterSlug={chapterSlug}
          currentPage={currentPage}
          onClose={closePanels}
          onChapterClick={(slug) =>
            bookSlug && router.push(`/books/${bookSlug}/chapter/${slug}`)
          }
          bookmarks={bookBookmarks}
          notes={bookNotes}
          onBookmarkSelect={(bookmark) => {
            goToPage(bookmark.page);
          }}
          onNoteSelect={(note) => {
            goToPage(note.page);
          }}
          onRemoveBookmark={removeBookmarkFromStore}
          onRemoveNote={removeNoteFromStore}
        />
      )}

      <ReaderNoteDialog
        isOpen={showNoteDialog}
        selectedText={selectedText}
        onClose={() => {
          setShowNoteDialog(false);
          setSelectedText("");
          iframeRef.current?.contentWindow?.getSelection()?.removeAllRanges();
        }}
        onSave={saveNote}
      />
    </div>
  );
}

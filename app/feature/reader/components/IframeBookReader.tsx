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
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import { useAuthStore } from "@/app/store/useAuthStore";

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
  const setFontSize = useReaderDataStore((state) => state.setFontSize);
  const setFontId = useReaderDataStore((state) => state.setFontId);
  const setThemeId = useReaderDataStore((state) => state.setThemeId);
  const [containerBg, setContainerBg] = useState("transparent");
  const [loading, setLoading] = useState(false);
  const fontsSnapshotRef = useRef({ fontId, fontSize });
  const hasCalculatedLayoutRef = useRef(false);
  const processedHtml = useReaderHtml({
    initialHtml,
    fontSize,
    fontId,
    themeId,
  });

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
    storageKey: `reading-pos-${bookSlug}-${chapterSlug}`,
    ready,
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
      if (e.key === "ArrowRight") handleNextPage();
      if (e.key === "ArrowLeft") handlePreviousPage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNextPage, handlePreviousPage]);

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
      fontsSnapshotRef.current.fontSize !== fontSize;

    fontsSnapshotRef.current = { fontId, fontSize };

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
    };
  }, [
    calculateTotalPages,
    currentPage,
    fontId,
    fontSize,
    goToPage,
    isPositionRestored,
    ready,
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

  const saveNote = (noteText: string) => {
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
      bookId: null,
    });
    setSelectedText("");
    setShowNoteDialog(false);
    iframeRef.current?.contentWindow?.getSelection()?.removeAllRanges();
  };

  const handleNoteClick = () => {
    if (selectedText) setShowNoteDialog(true);
    else alert("Vui lòng bôi đen văn bản để tạo ghi chú");
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

        <ReaderPageNavigation
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={handlePreviousPage}
          onNext={handleNextPage}
          canGoPrev={canNavigateBackward}
          canGoNext={canNavigateForward}
        />

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

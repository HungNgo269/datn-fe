"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ReaderChaptersList from "./ReaderChaptersList";
import ReaderFrame from "./ReaderFrame";
import ReaderNoteDialog from "./ReaderNoteDialog";
import ReaderPageNavigation from "./ReaderPageNavigation";
import ReaderSettings, { THEMES } from "./readerSetting";
import ReaderTopBar from "./ReaderTopBar";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import type { NoteColor } from "@/app/types/book.types";
import { ChapterCardProps } from "@/app/feature/chapters/types/chapter.type";
import { useReaderHtml } from "../hook/useReaderHTML";
import { useReaderPagination } from "../hook/useReaderPagination";
import { useChapterStream } from "../hook/useChapterStream";
import { useChapterPrefetch } from "../hook/useChapterPrefetch";
import {
  applyNoteHighlights as applyReaderNoteHighlights,
  highlightSelection as highlightReaderSelection,
} from "../utils/readerHighlights";
import {
  ReaderBlockingOverlay,
  ReaderStreamError,
  ReaderStreamProgress,
  ReaderStreamSkeleton,
} from "./ReaderStreamOverlays";

const READER_ROOT_ID = "reader-content-root";

interface Props {
  initialHtml: string;
  title: string;
  contentUrl?: string | null;
  bookSlug?: string;
  chapterSlug?: string;
  chapters?: ChapterCardProps[];
  currentChapterOrder?: number;
  nextChapterSlug?: string | null;
  bookTitle?: string;
  bookCoverImage?: string | null;
  bookId?: number | null;
  isLocked?: boolean;
}

export default function IframeBookReader({
  initialHtml,
  title,
  contentUrl,
  bookSlug,
  chapterSlug,
  chapters = [],
  nextChapterSlug,
  bookTitle,
  bookCoverImage,
  bookId,
  isLocked = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPageFromUrl = useMemo(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) {
      const parsed = parseInt(pageParam, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }, [searchParams]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const bookmarksStore = useReaderDataStore((state) => state.bookmarks);
  const notesStore = useReaderDataStore((state) => state.notes);
  const toggleBookmark = useReaderDataStore((state) => state.toggleBookmark);
  const addNoteToStore = useReaderDataStore((state) => state.addNote);
  const removeBookmarkFromStore = useReaderDataStore(
    (state) => state.removeBookmark,
  );
  const removeNoteFromStore = useReaderDataStore((state) => state.removeNote);
  const updateContinueReading = useReaderDataStore(
    (state) => state.updateContinueReading,
  );

  const [ready, setReady] = useState(false);
  const [openPanel, setOpenPanel] = useState<"settings" | "chapters" | null>(
    null,
  );
  const fontSize = useReaderDataStore((state) => state.fontSize);
  const fontId = useReaderDataStore((state) => state.fontId);
  const themeId = useReaderDataStore((state) => state.themeId);
  const readMode = useReaderDataStore((state) => state.readMode);
  const setFontSize = useReaderDataStore((state) => state.setFontSize);
  const setFontId = useReaderDataStore((state) => state.setFontId);
  const setThemeId = useReaderDataStore((state) => state.setThemeId);
  const setReadMode = useReaderDataStore((state) => state.setReadMode);
  const [containerBg, setContainerBg] = useState<string>("");
  const fontsSnapshotRef = useRef({ fontId, fontSize, readMode });
  const hasCalculatedLayoutRef = useRef(false);
  const [retryToken, setRetryToken] = useState(0);
  const [hasStreamedContent, setHasStreamedContent] = useState(
    Boolean(initialHtml),
  );
  const hasStreamedContentRef = useRef(Boolean(initialHtml));
  const streamedBodyRef = useRef(initialHtml);
  const streamedHeadRef = useRef("");
  const headNodesRef = useRef<Node[]>([]);
  const recalcTimerRef = useRef<number | null>(null);
  const restoreTargetRef = useRef<number | null>(null);
  const readerShellHtml = useMemo(
    () =>
      '<!doctype html><html><head></head><body><div id="reader-content-root"></div></body></html>',
    [],
  );

  useChapterPrefetch({
    bookSlug,
    nextChapterSlug,
  });

  const processedHtml = useReaderHtml({
    initialHtml: readerShellHtml,
    fontSize,
    fontId,
    themeId,
    readMode,
  });

  const positionKeyBase = `reading-pos-${bookSlug}-${chapterSlug}`;
  const storageKey =
    readMode === "paged" ? positionKeyBase : `${positionKeyBase}-scroll`;
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
    storageKey,
    ready,
    readMode,
    initialPage: initialPageFromUrl,
  });

  const scheduleRecalc = useCallback(() => {
    if (recalcTimerRef.current !== null) return;
    recalcTimerRef.current = window.setTimeout(() => {
      recalcTimerRef.current = null;
      calculateTotalPages();
    }, 200);
  }, [calculateTotalPages]);

  const markContentReady = useCallback(() => {
    if (hasStreamedContentRef.current) return;
    hasStreamedContentRef.current = true;
    setHasStreamedContent(true);
  }, []);

  const ensureRoot = useCallback((doc: Document) => {
    let root = doc.getElementById(READER_ROOT_ID);
    if (!root) {
      root = doc.createElement("div");
      root.id = READER_ROOT_ID;
      doc.body.appendChild(root);
    }
    return root;
  }, []);

  const applyHeadHtml = useCallback(
    (headHtml: string) => {
      streamedHeadRef.current = headHtml;
      const doc = iframeRef.current?.contentDocument;
      if (!doc?.head) return;

      headNodesRef.current.forEach((node) =>
        node.parentNode?.removeChild(node),
      );
      headNodesRef.current = [];

      if (!headHtml) return;

      const template = doc.createElement("template");
      template.innerHTML = headHtml;
      const nodes = Array.from(template.content.childNodes);
      nodes.forEach((node) => doc.head.appendChild(node));
      headNodesRef.current = nodes;
    },
    [iframeRef],
  );

  const appendChunk = useCallback(
    (chunk: string) => {
      if (!chunk) return;
      streamedBodyRef.current += chunk;
      markContentReady();

      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;

      const root = ensureRoot(doc);
      root.insertAdjacentHTML("beforeend", chunk);
      scheduleRecalc();
    },
    [ensureRoot, iframeRef, markContentReady, scheduleRecalc],
  );

  const resetStreamState = useCallback(() => {
    streamedBodyRef.current = initialHtml || "";
    streamedHeadRef.current = "";
    headNodesRef.current.forEach((node) => node.parentNode?.removeChild(node));
    headNodesRef.current = [];
    hasCalculatedLayoutRef.current = false;
    hasStreamedContentRef.current = Boolean(initialHtml);
    setHasStreamedContent(Boolean(initialHtml));

    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      const root = ensureRoot(doc);
      root.innerHTML = streamedBodyRef.current;
    }
  }, [ensureRoot, iframeRef, initialHtml]);

  useEffect(() => {
    resetStreamState();
  }, [bookSlug, chapterSlug, resetStreamState, retryToken]);

  const shouldStream = Boolean(
    !isLocked && (contentUrl || (bookSlug && chapterSlug)),
  );

  const {
    isLoading: isStreamLoading,
    progress: streamProgress,
    error: streamError,
  } = useChapterStream({
    contentUrl,
    bookSlug,
    chapterSlug,
    enabled: shouldStream,
    refreshKey: retryToken,
    onHead: applyHeadHtml,
    onChunk: appendChunk,
    onFinish: scheduleRecalc,
  });

  const [selectedText, setSelectedText] = useState("");
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const bookBookmarks = useMemo(() => {
    if (!bookSlug) return [];
    return bookmarksStore.filter(
      (bookmark) =>
        bookmark.bookSlug === bookSlug && bookmark.userId === userId,
    );
  }, [bookSlug, bookmarksStore, userId]);

  const bookNotes = useMemo(() => {
    if (!bookSlug) return [];
    return notesStore.filter(
      (note) => note.bookSlug === bookSlug && note.userId === userId,
    );
  }, [bookSlug, notesStore, userId]);

  const applyNoteHighlights = useCallback(
    (doc: Document, notes: typeof bookNotes) => {
      applyReaderNoteHighlights(doc, notes);
    },
    [],
  );

  const highlightSelection = useCallback((doc: Document, color: NoteColor) => {
    highlightReaderSelection(doc, color);
  }, []);

  useEffect(() => {
    if (!ready || isStreamLoading || !iframeRef.current?.contentDocument)
      return;
    applyNoteHighlights(iframeRef.current.contentDocument, bookNotes);
  }, [applyNoteHighlights, bookNotes, isStreamLoading, ready]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue(theme.bgVar)
      .trim();
    setContainerBg(bgColor || "transparent");
  }, [themeId]);

  useEffect(() => {
    restoreTargetRef.current = null;
  }, [bookSlug, chapterSlug, initialPageFromUrl, readMode]);

  useEffect(() => {
    if (!ready) return;
    if (restoreTargetRef.current !== null) return;

    let targetPage = initialPageFromUrl;
    if (!targetPage && typeof window !== "undefined") {
      const savedPage = localStorage.getItem(storageKey);
      if (savedPage) {
        const parsed = parseInt(savedPage, 10);
        if (!isNaN(parsed)) {
          targetPage = parsed;
        }
      }
    }

    restoreTargetRef.current = targetPage ?? 1;
  }, [initialPageFromUrl, ready, storageKey]);

  useEffect(() => {
    const target = restoreTargetRef.current;
    if (!target || target <= 1) return;
    if (currentPage !== 1) return;
    if (totalPages >= target) {
      goToPage(target);
    }
  }, [currentPage, goToPage, totalPages]);

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
    [bookSlug, router],
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
    readMode,
  ]);

  const handleIframeLoad = useCallback(() => {
    setReady(true);
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const root = ensureRoot(doc);
    root.innerHTML = streamedBodyRef.current;

    if (streamedBodyRef.current) {
      markContentReady();
    }

    applyHeadHtml(streamedHeadRef.current);
    scheduleRecalc();
  }, [applyHeadHtml, ensureRoot, markContentReady, scheduleRecalc]);

  const handleBookmark = useCallback(() => {
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
  }, [
    bookCoverImage,
    bookId,
    bookSlug,
    bookTitle,
    chapterSlug,
    currentChapter?.title,
    currentPage,
    title,
    toggleBookmark,
    userId,
  ]);

  const saveNote = useCallback(
    (noteText: string, color: NoteColor) => {
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
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        highlightSelection(doc, color);
      }
      setSelectedText("");
      setShowNoteDialog(false);
      iframeRef.current?.contentWindow?.getSelection()?.removeAllRanges();
    },
    [
      addNoteToStore,
      bookSlug,
      bookTitle,
      chapterSlug,
      currentChapter?.title,
      currentPage,
      highlightSelection,
      selectedText,
      title,
      userId,
    ],
  );

  const handleNoteClick = useCallback(() => {
    if (selectedText) setShowNoteDialog(true);
    else toast.error("Vui lòng bôi đen văn bản để tạo ghi chú");
  }, [selectedText]);

  const handleBackToBook = useCallback(() => {
    if (bookSlug) {
      router.push(`/books/${bookSlug}`);
    }
  }, [bookSlug, router]);

  const handleChapterClick = useCallback(
    (slug: string) => {
      if (bookSlug) {
        router.push(`/books/${bookSlug}/chapter/${slug}`);
      }
    },
    [bookSlug, router],
  );

  const handleNoteDialogClose = useCallback(() => {
    setShowNoteDialog(false);
    setSelectedText("");
    iframeRef.current?.contentWindow?.getSelection()?.removeAllRanges();
  }, []);

  const handleRetry = useCallback(() => {
    setRetryToken((prev) => prev + 1);
  }, []);

  const isSettingsOpen = openPanel === "settings";
  const isChaptersOpen = openPanel === "chapters";

  const togglePanel = useCallback((panel: "settings" | "chapters") => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  }, []);

  const closePanels = useCallback(() => setOpenPanel(null), []);

  const showBlockingOverlay = !ready;
  const showStreamProgress = shouldStream && isStreamLoading;
  const showStreamSkeleton = showStreamProgress && !hasStreamedContent;
  const showStreamError = Boolean(streamError);

  const isBookmarked = bookBookmarks.some(
    (bookmark) =>
      bookmark.page === currentPage &&
      bookmark.chapterSlug === (chapterSlug || null),
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
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-muted transition-colors duration-300">
      <ReaderTopBar
        title={title}
        currentPage={currentPage}
        totalPages={totalPages}
        themeBg={containerBg}
        isDarkTheme={themeId === "dark" || themeId === "gray"}
        onBackToBook={handleBackToBook}
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

      <div className="relative h-full w-full flex-1 overflow-hidden">
        {showStreamProgress ? (
          <ReaderStreamProgress progress={streamProgress} />
        ) : null}

        <ReaderFrame
          iframeRef={iframeRef}
          srcDoc={processedHtml}
          onLoad={handleIframeLoad}
          isReady={ready}
          themeId={themeId}
          bgStyle={containerBg}
        />

        {showStreamSkeleton ? <ReaderStreamSkeleton /> : null}

        {showStreamError ? <ReaderStreamError onRetry={handleRetry} /> : null}

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

        {showBlockingOverlay && <ReaderBlockingOverlay />}
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
          onChapterClick={handleChapterClick}
          bookmarks={bookBookmarks}
          notes={bookNotes}
          onBookmarkSelect={(bookmark) => {
            if (bookmark.chapterSlug && bookmark.chapterSlug !== chapterSlug) {
              // Navigate to the correct chapter first, then the page
              if (bookSlug) {
                router.push(
                  `/books/${bookSlug}/chapter/${bookmark.chapterSlug}?page=${bookmark.page}`,
                );
              }
            } else {
              goToPage(bookmark.page);
            }
          }}
          onNoteSelect={(note) => {
            if (note.chapterSlug && note.chapterSlug !== chapterSlug) {
              // Navigate to the correct chapter first, then the page
              if (bookSlug) {
                router.push(
                  `/books/${bookSlug}/chapter/${note.chapterSlug}?page=${note.page}`,
                );
              }
            } else {
              goToPage(note.page);
            }
          }}
          onRemoveBookmark={removeBookmarkFromStore}
          onRemoveNote={removeNoteFromStore}
        />
      )}

      <ReaderNoteDialog
        isOpen={showNoteDialog}
        selectedText={selectedText}
        onClose={handleNoteDialogClose}
        onSave={saveNote}
      />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ReaderChaptersList from "./ReaderChaptersList";
import ReaderFrame from "./ReaderFrame";
import ReaderNoteDialog from "./ReaderNoteDialog";
import ReaderPageNavigation from "./ReaderPageNavigation";
import ReaderPageProgress from "./ReaderPageProgress";
import ReaderSettings, { THEMES } from "./readerSetting";
import ReaderTopBar from "./ReaderTopBar";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import { ChapterCardProps } from "@/app/feature/chapters/types/chapter.type";
import { useReaderHtml } from "../hook/useReaderHTML";
import { useReaderPagination } from "../hook/useReaderPagination";
import { useChapterStream } from "../hook/useChapterStream";
import { useChapterPrefetch } from "../hook/useChapterPrefetch";
import { useReaderNavigation } from "../hook/useReaderNavigation";
import { useReaderInteraction } from "../hook/useReaderInteraction";
import { resolvePageFromSelector } from "../utils/readerPosition";
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
  
  // Navigation Hook
  const {
    currentChapterTitle,
    resolvedNextChapterSlug,
    goToNextChapter,
    goToPreviousChapter,
    handleBackToBook,
    handleChapterClick,
  } = useReaderNavigation({
    chapters,
    chapterSlug,
    bookSlug,
    nextChapterSlug,
  });

  const [ready, setReady] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);
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
  const [containerBg, setContainerBg] = useState<string>("");
  const fontsSnapshotRef = useRef({ fontId, fontSize, readMode });
  const hasCalculatedLayoutRef = useRef(false);
  const [retryToken, setRetryToken] = useState(0);
  const [hasStreamedContent, setHasStreamedContent] = useState(
    Boolean(initialHtml)
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
    []
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
        node.parentNode?.removeChild(node)
      );
      headNodesRef.current = [];

      if (!headHtml) return;

      const template = doc.createElement("template");
      template.innerHTML = headHtml;
      const nodes = Array.from(template.content.childNodes);
      nodes.forEach((node) => doc.head.appendChild(node));
      headNodesRef.current = nodes;
    },
    [iframeRef]
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
    [ensureRoot, iframeRef, markContentReady, scheduleRecalc]
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
    !isLocked && (contentUrl || (bookSlug && chapterSlug))
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

  // Interaction Hook (Bookmarks, Notes)
  const {
    bookBookmarks,
    bookNotes,
    isBookmarked,
    selectedText,
    showNoteDialog,
    handleBookmark,
    saveNote,
    handleNoteClick,
    handleNoteDialogClose,
    removeBookmarkFromStore,
    removeNoteFromStore,
  } = useReaderInteraction({
    userId,
    bookSlug,
    bookId,
    bookTitle,
    bookCoverImage,
    title,
    chapterSlug,
    chapterTitle: currentChapterTitle,
    currentPage,
    iframeRef,
    ready,
    isStreamLoading,
    layoutVersion,
  });

  const resolvedBookmarks = useMemo(() => {
    if (!ready) return bookBookmarks;
    const iframe = iframeRef.current;
    if (!iframe) return bookBookmarks;

    return bookBookmarks.map((bookmark) => {
      if (bookmark.chapterSlug && bookmark.chapterSlug !== chapterSlug) {
        return bookmark;
      }
      if (!bookmark.selectorPath) return bookmark;
      const resolvedPage = resolvePageFromSelector(
        iframe,
        bookmark.selectorPath,
        readMode
      );
      if (!resolvedPage || resolvedPage === bookmark.page) return bookmark;
      return { ...bookmark, page: resolvedPage };
    });
  }, [
    bookBookmarks,
    chapterSlug,
    fontId,
    fontSize,
    layoutVersion,
    readMode,
    ready,
    totalPages,
  ]);

  const resolvedNotes = useMemo(() => {
    if (!ready) return bookNotes;
    const iframe = iframeRef.current;
    if (!iframe) return bookNotes;

    return bookNotes.map((note) => {
      if (note.chapterSlug && note.chapterSlug !== chapterSlug) {
        return note;
      }
      if (!note.selectorPath) return note;
      const resolvedPage = resolvePageFromSelector(
        iframe,
        note.selectorPath,
        readMode
      );
      if (!resolvedPage || resolvedPage === note.page) return note;
      return { ...note, page: resolvedPage };
    });
  }, [
    bookNotes,
    chapterSlug,
    fontId,
    fontSize,
    layoutVersion,
    readMode,
    ready,
    totalPages,
  ]);

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
      restoreTargetRef.current = 1;
    }
  }, [currentPage, goToPage, totalPages]);
  
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
    currentPage > 1 || Boolean(bookSlug); // simplified, logic was (previousChapterSlug || bookSlug)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (readMode !== "paged") return;
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextPage();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePreviousPage();
      }
    };
    window.addEventListener("keydown", handleKey);
    const iframeWindow = ready ? iframeRef.current?.contentWindow : null;
    iframeWindow?.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      iframeWindow?.removeEventListener("keydown", handleKey);
    };
  }, [handleNextPage, handlePreviousPage, iframeRef, layoutVersion, readMode, ready]);

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
    setLayoutVersion((prev) => prev + 1);
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
          <>
            <ReaderPageNavigation
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={handlePreviousPage}
              onNext={handleNextPage}
              canGoPrev={canNavigateBackward}
              canGoNext={canNavigateForward}
            />
            <ReaderPageProgress
              currentPage={currentPage}
              totalPages={totalPages}
              onChangePage={goToPage}
              themeBg={containerBg}
              isDarkTheme={themeId === "dark" || themeId === "gray"}
            />
          </>
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
          bookmarks={resolvedBookmarks}
          notes={resolvedNotes}
          onBookmarkSelect={(bookmark) => {
            if (bookmark.chapterSlug && bookmark.chapterSlug !== chapterSlug) {
              // Navigate to the correct chapter first, then the page
              if (bookSlug) {
                router.push(
                  `/books/${bookSlug}/chapter/${bookmark.chapterSlug}?page=${bookmark.page}`
                );
              }
            } else {
              const iframe = iframeRef.current;
              const resolvedPage =
                iframe && bookmark.selectorPath
                  ? resolvePageFromSelector(
                      iframe,
                      bookmark.selectorPath,
                      readMode
                    )
                  : null;
              goToPage(resolvedPage ?? bookmark.page);
            }
          }}
          onNoteSelect={(note) => {
            if (note.chapterSlug && note.chapterSlug !== chapterSlug) {
              // Navigate to the correct chapter first, then the page
              if (bookSlug) {
                router.push(
                  `/books/${bookSlug}/chapter/${note.chapterSlug}?page=${note.page}`
                );
              }
            } else {
              const iframe = iframeRef.current;
              const resolvedPage =
                iframe && note.selectorPath
                  ? resolvePageFromSelector(iframe, note.selectorPath, readMode)
                  : null;
              goToPage(resolvedPage ?? note.page);
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

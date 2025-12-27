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
}

export default function IframeBookReader({
  initialHtml,
  title,
  bookSlug,
  chapterSlug,
  chapters = [],
  nextChapterSlug,
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

  const [ready, setReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChaptersList, setShowChaptersList] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [fontId, setFontId] = useState("sans");
  const [themeId, setThemeId] = useState("light");
  const [containerBg, setContainerBg] = useState("transparent");
  const [loading, setLoading] = useState(false);
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
      (bookmark) =>
        bookmark.bookSlug === bookSlug && bookmark.userId === userId
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

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
    if (ready && isPositionRestored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      const timer = setTimeout(() => {
        const newTotal = calculateTotalPages();

        let targetPage = currentPage;
        if (targetPage > newTotal && newTotal > 0) {
          targetPage = newTotal;
        }

        goToPage(targetPage);
      }, 150);
      setLoading(false);

      return () => clearTimeout(timer);
    }
  }, [fontSize, fontId, ready, isPositionRestored]);

  const handleIframeLoad = () => setReady(true);

  const currentChapter = useMemo(() => {
    return chapters.find((chapter) => chapter.slug === chapterSlug);
  }, [chapters, chapterSlug]);

  const handleBookmark = () => {
    if (!bookSlug) {
      return;
    }
    toggleBookmark({
      userId,
      bookSlug,
      bookTitle: title,
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
      bookTitle: title,
      chapterSlug: chapterSlug || null,
      chapterTitle: currentChapter?.title ?? null,
      page: currentPage,
      selectedText,
      note: noteText.trim(),
    });
    setSelectedText("");
    setShowNoteDialog(false);
    iframeRef.current?.contentWindow?.getSelection()?.removeAllRanges();
  };

  const handleNoteClick = () => {
    if (selectedText) setShowNoteDialog(true);
    else alert("Vui lòng bôi đen văn bản để tạo ghi chú");
  };

  const isBookmarked = bookBookmarks.some(
    (bookmark) =>
      bookmark.page === currentPage &&
      bookmark.chapterSlug === (chapterSlug || null)
  );

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-muted transition-colors duration-300">
      <ReaderTopBar
        title={title}
        currentPage={currentPage}
        totalPages={totalPages}
        onBackToBook={() => bookSlug && router.push(`/books/${bookSlug}`)}
        onNextChapter={() => {
          if (nextChapterSlug && bookSlug)
            router.push(`/books/${bookSlug}/chapter/${nextChapterSlug}`);
          else if (bookSlug) router.push(`/books/${bookSlug}`);
        }}
        nextChapterSlug={nextChapterSlug}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onToggleChapters={() => setShowChaptersList(!showChaptersList)}
        onToggleNotes={handleNoteClick}
        isBookmarked={isBookmarked}
        onToggleBookmark={handleBookmark}
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
          onPrev={prev}
          onNext={next}
        />

        {loading ||
          !ready ||
          (!isPositionRestored && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
              <div className="w-8 h-8 border-4 border-muted border-t-green-500 rounded-full animate-spin"></div>
            </div>
          ))}
      </div>

      <ReaderSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        currentTheme={themeId}
        setTheme={setThemeId}
        currentFont={fontId}
        setFont={setFontId}
      />

      {showChaptersList && (
        <ReaderChaptersList
          chapters={chapters}
          currentChapterSlug={chapterSlug}
          currentPage={currentPage}
          onClose={() => setShowChaptersList(false)}
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

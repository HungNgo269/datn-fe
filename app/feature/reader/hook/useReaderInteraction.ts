import { useCallback, useMemo, useState, useEffect, RefObject } from "react";
import { toast } from "sonner";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import type { NoteColor } from "@/app/types/book.types";
import {
  applyNoteHighlights as applyReaderNoteHighlights,
  highlightSelection as highlightReaderSelection,
} from "../utils/readerHighlights";
import {
  captureBookmarkAnchorPath,
  captureSelectionAnchorPath,
  resolvePageFromSelector,
} from "../utils/readerPosition";
import { useRouter } from "next/navigation";

interface UseReaderInteractionProps {
  userId: number | null;
  bookSlug?: string;
  bookId?: number | null;
  bookTitle?: string;
  bookCoverImage?: string | null;
  title: string;
  chapterSlug?: string;
  chapterTitle?: string | null;
  currentPage: number;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  ready: boolean;
  isStreamLoading: boolean;
  layoutVersion: number;
}

export function useReaderInteraction({
  userId,
  bookSlug,
  bookId,
  bookTitle,
  bookCoverImage,
  title,
  chapterSlug,
  chapterTitle,
  currentPage,
  iframeRef,
  ready,
  isStreamLoading,
  layoutVersion,
}: UseReaderInteractionProps) {
  const router = useRouter();
  const bookmarksStore = useReaderDataStore((state) => state.bookmarks);
  const notesStore = useReaderDataStore((state) => state.notes);
  const toggleBookmark = useReaderDataStore((state) => state.toggleBookmark);
  const addNoteToStore = useReaderDataStore((state) => state.addNote);
  const removeBookmarkFromStore = useReaderDataStore((state) => state.removeBookmark);
  const removeNoteFromStore = useReaderDataStore((state) => state.removeNote);
  const fontSize = useReaderDataStore((state) => state.fontSize);
  const fontId = useReaderDataStore((state) => state.fontId);
  const readMode = useReaderDataStore((state) => state.readMode);
  const updateContinueReading = useReaderDataStore(
    (state) => state.updateContinueReading
  );

  const [selectedText, setSelectedText] = useState("");
  const [selectedAnchorPath, setSelectedAnchorPath] = useState<string | null>(
    null
  );
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

  const isBookmarked = useMemo(() => {
    const iframe = iframeRef.current;
    return bookBookmarks.some((bookmark) => {
      if (bookmark.chapterSlug !== (chapterSlug || null)) return false;
      if (bookmark.selectorPath && iframe && ready) {
        const resolvedPage = resolvePageFromSelector(
          iframe,
          bookmark.selectorPath,
          readMode
        );
        if (resolvedPage) return resolvedPage === currentPage;
      }
      return bookmark.page === currentPage;
    });
  }, [
    bookBookmarks,
    chapterSlug,
    currentPage,
    fontId,
    fontSize,
    iframeRef,
    layoutVersion,
    readMode,
    ready,
  ]);

  const applyNoteHighlights = useCallback(
    (doc: Document, notes: typeof bookNotes) => {
      applyReaderNoteHighlights(doc, notes);
    },
    []
  );

  const highlightSelection = useCallback((doc: Document, color: NoteColor) => {
    highlightReaderSelection(doc, color);
  }, []);

  // Apply highlights when ready or notes change
  useEffect(() => {
    if (!ready || isStreamLoading || !iframeRef.current?.contentDocument)
      return;
    applyNoteHighlights(iframeRef.current.contentDocument, bookNotes);
  }, [
    applyNoteHighlights,
    bookNotes,
    isStreamLoading,
    layoutVersion,
    ready,
    iframeRef,
  ]);

  // Handle text selection in iframe
  useEffect(() => {
    if (!ready || !iframeRef.current?.contentWindow) return;
    const handleSelection = () => {
      const selection = iframeRef.current?.contentWindow?.getSelection();
      const selectionText = selection?.toString().trim() || "";
      setSelectedText(selectionText);
      if (selectionText && iframeRef.current) {
        setSelectedAnchorPath(
          captureSelectionAnchorPath(iframeRef.current)
        );
      } else {
        setSelectedAnchorPath(null);
      }
    };
    const doc = iframeRef.current.contentWindow.document;
    doc.addEventListener("mouseup", handleSelection);
    doc.addEventListener("keyup", handleSelection);
    return () => {
      doc.removeEventListener("mouseup", handleSelection);
      doc.removeEventListener("keyup", handleSelection);
    };
  }, [ready, layoutVersion, iframeRef]);

  // Update continue reading on changes
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
      chapterTitle: chapterTitle ?? null,
      page: currentPage,
    });
  }, [
    bookCoverImage,
    bookSlug,
    bookTitle,
    chapterSlug,
    chapterTitle,
    currentPage,
    title,
    updateContinueReading,
    userId,
    bookId
  ]);

  const handleBookmark = useCallback(() => {
    if (!bookSlug) {
      return;
    }
    const iframe = iframeRef.current;
    const selectorPath = iframe ? captureBookmarkAnchorPath(iframe) : null;
    const currentChapter = chapterSlug ?? null;
    const chapterBookmarks = bookBookmarks.filter(
      (bookmark) => bookmark.chapterSlug === currentChapter
    );

    let matched = selectorPath
      ? chapterBookmarks.find((bookmark) => bookmark.selectorPath === selectorPath)
      : undefined;

    if (!matched) {
      matched = chapterBookmarks.find((bookmark) => {
        if (bookmark.selectorPath && iframe && ready) {
          const resolvedPage = resolvePageFromSelector(
            iframe,
            bookmark.selectorPath,
            readMode
          );
          if (resolvedPage) return resolvedPage === currentPage;
        }
        return bookmark.page === currentPage;
      });
    }

    if (matched) {
      removeBookmarkFromStore(matched.id);
      return;
    }

    toggleBookmark({
      userId,
      bookId: bookId ?? null,
      bookSlug,
      bookTitle: bookTitle ?? title,
      bookCoverImage: bookCoverImage ?? null,
      chapterSlug: chapterSlug || null,
      chapterTitle: chapterTitle ?? null,
      selectorPath,
      page: currentPage,
    });
  }, [
    bookCoverImage,
    bookId,
    bookSlug,
    bookTitle,
    bookBookmarks,
    chapterSlug,
    chapterTitle,
    currentPage,
    iframeRef,
    readMode,
    ready,
    removeBookmarkFromStore,
    title,
    toggleBookmark,
    userId,
  ]);

  const saveNote = useCallback(
    (noteText: string, color: NoteColor) => {
      if (!bookSlug || !selectedText || !noteText.trim()) {
        return;
      }
      const selectorPath =
        selectedAnchorPath ??
        (iframeRef.current?.contentWindow != null
          ? captureSelectionAnchorPath(iframeRef.current) ??
            captureBookmarkAnchorPath(iframeRef.current)
          : null);
      addNoteToStore({
        userId,
        bookSlug,
        bookTitle: bookTitle ?? title,
        chapterSlug: chapterSlug || null,
        chapterTitle: chapterTitle ?? null,
        page: currentPage,
        selectedText,
        note: noteText.trim(),
        color,
        selectorPath,
        bookId: null,
      });
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        highlightSelection(doc, color);
      }
      setSelectedText("");
      setSelectedAnchorPath(null);
      setShowNoteDialog(false);
      iframeRef.current?.contentWindow?.getSelection()?.removeAllRanges();
    },
    [
      addNoteToStore,
      bookSlug,
      bookTitle,
      chapterSlug,
      chapterTitle,
      currentPage,
      highlightSelection,
      selectedAnchorPath,
      selectedText,
      title,
      userId,
      iframeRef,
    ]
  );

  const handleNoteClick = useCallback(() => {
    const liveSelection = iframeRef.current?.contentWindow
      ?.getSelection()
      ?.toString()
      .trim();
    const nextSelection = liveSelection || selectedText;
    const nextAnchorPath =
      (liveSelection && iframeRef.current
        ? captureSelectionAnchorPath(iframeRef.current)
        : selectedAnchorPath) ??
      (iframeRef.current ? captureBookmarkAnchorPath(iframeRef.current) : null);
    if (nextSelection) {
      setSelectedText(nextSelection);
      setSelectedAnchorPath(nextAnchorPath);
      setShowNoteDialog(true);
      return;
    }
    toast.error("Vui lòng bôi đen văn bản để tạo ghi chú");
  }, [iframeRef, selectedAnchorPath, selectedText]);

  const handleNoteDialogClose = useCallback(() => {
    setShowNoteDialog(false);
    setSelectedText("");
    setSelectedAnchorPath(null);
    iframeRef.current?.contentWindow?.getSelection()?.removeAllRanges();
  }, [iframeRef]);

  const goToPage = (page: number) => {
      // Just a helper for typescript types in return, actual goToPage comes from pagination hook
      // But we need router navigation for cross-chapter bookmarks
  }

  return {
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
  };
}

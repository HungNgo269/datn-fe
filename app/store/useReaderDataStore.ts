"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ContinueReadingEntry,
  ReaderBookmark,
  ReaderNote,
  ReaderReadMode,
} from "../types/book.types";

const getDefaultReadMode = (): ReaderReadMode => {
  if (typeof window === "undefined") {
    return "paged";
  }
  return window.innerWidth < 768 ? "scroll" : "paged";
};

interface ReaderDataState {
  bookmarks: ReaderBookmark[];
  notes: ReaderNote[];
  continueReading: ContinueReadingEntry | null;
  readingHistory: ContinueReadingEntry[];
  fontSize: number;
  fontId: string;
  themeId: string;
  readMode: ReaderReadMode;
  toggleBookmark: (bookmark: Omit<ReaderBookmark, "id" | "createdAt">) => void;
  removeBookmark: (id: string) => void;
  addNote: (note: Omit<ReaderNote, "id" | "createdAt">) => void;
  removeNote: (id: string) => void;
  updateContinueReading: (
    entry: Omit<ContinueReadingEntry, "updatedAt">
  ) => void;
  setFontSize: (size: number) => void;
  setFontId: (fontId: string) => void;
  setThemeId: (themeId: string) => void;
  setReadMode: (mode: ReaderReadMode) => void;
}

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useReaderDataStore = create<ReaderDataState>()(
  persist(
    (set) => ({
      bookmarks: [],
      notes: [],
      continueReading: null,
      readingHistory: [],
      fontSize: 18,
      fontId: "sans",
      themeId: "light",
      readMode: getDefaultReadMode(),
      toggleBookmark(payload) {
        set((state) => {
          const matcher = (bookmark: ReaderBookmark) =>
            bookmark.userId === payload.userId &&
            bookmark.bookSlug === payload.bookSlug &&
            bookmark.chapterSlug === (payload.chapterSlug ?? null) &&
            bookmark.page === payload.page;

          const exists = state.bookmarks.find(matcher);

          if (exists) {
            return {
              bookmarks: state.bookmarks.filter(
                (bookmark) => !matcher(bookmark)
              ),
            };
          }

          const nextBookmark: ReaderBookmark = {
            ...payload,
            bookId: payload.bookId ?? null,
            chapterSlug: payload.chapterSlug ?? null,
            chapterTitle: payload.chapterTitle ?? null,
            bookCoverImage: payload.bookCoverImage ?? null,
            id: createId(),
            createdAt: new Date().toISOString(),
          };

          return { bookmarks: [...state.bookmarks, nextBookmark] };
        });
      },
      removeBookmark(id) {
        set((state) => ({
          bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== id),
        }));
      },
      addNote(payload) {
        set((state) => {
          const nextNote: ReaderNote = {
            ...payload,
            chapterSlug: payload.chapterSlug ?? null,
            chapterTitle: payload.chapterTitle ?? null,
            color: payload.color ?? "yellow",
            id: createId(),
            createdAt: new Date().toISOString(),
          };
          return { notes: [...state.notes, nextNote] };
        });
      },
      removeNote(id) {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      updateContinueReading(payload) {
        set((state) => {
          const entry: ContinueReadingEntry = {
            ...payload,
            bookId: payload.bookId ?? null,
            chapterSlug: payload.chapterSlug ?? null,
            chapterTitle: payload.chapterTitle ?? null,
            bookCoverImage: payload.bookCoverImage ?? null,
            updatedAt: new Date().toISOString(),
          };

          const filteredHistory = state.readingHistory.filter(
            (item) =>
              !(
                item.userId === entry.userId && item.bookSlug === entry.bookSlug
              )
          );

          const nextHistory = [entry, ...filteredHistory].slice(0, 20);

          return {
            continueReading: entry,
            readingHistory: nextHistory,
          };
        });
      },
      setFontSize(size) {
        set({ fontSize: size });
      },
      setFontId(fontId) {
        set({ fontId });
      },
      setThemeId(themeId) {
        set({ themeId });
      },
      setReadMode(readMode) {
        set({ readMode });
      },
    }),
    {
      name: "reader-data",
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        notes: state.notes,
        continueReading: state.continueReading,
        readingHistory: state.readingHistory,
        fontSize: state.fontSize,
        fontId: state.fontId,
        themeId: state.themeId,
        readMode: state.readMode,
      }),
    }
  )
);

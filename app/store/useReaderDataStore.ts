"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ReaderBookmark {
  id: string;
  userId: number | null;
  bookSlug: string;
  bookTitle: string;
  chapterSlug?: string | null;
  chapterTitle?: string | null;
  page: number;
  createdAt: string;
}

export interface ReaderNote extends ReaderBookmark {
  selectedText: string;
  note: string;
}

interface ReaderDataState {
  bookmarks: ReaderBookmark[];
  notes: ReaderNote[];
  toggleBookmark: (bookmark: Omit<ReaderBookmark, "id" | "createdAt">) => void;
  removeBookmark: (id: string) => void;
  addNote: (note: Omit<ReaderNote, "id" | "createdAt">) => void;
  removeNote: (id: string) => void;
}

const createId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);

export const useReaderDataStore = create<ReaderDataState>()(
  persist(
    (set) => ({
      bookmarks: [],
      notes: [],
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
              bookmarks: state.bookmarks.filter((bookmark) => !matcher(bookmark)),
            };
          }

          const nextBookmark: ReaderBookmark = {
            ...payload,
            chapterSlug: payload.chapterSlug ?? null,
            chapterTitle: payload.chapterTitle ?? null,
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
    }),
    {
      name: "reader-data",
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        notes: state.notes,
      }),
    }
  )
);

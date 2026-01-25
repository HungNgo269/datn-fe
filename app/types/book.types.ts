export interface ReaderBookmark {
  id: string;
  userId: number | null;
  bookId: number | null;
  bookSlug: string;
  bookTitle: string;
  bookCoverImage?: string | null;
  chapterSlug?: string | null;
  chapterTitle?: string | null;
  selectorPath?: string | null;
  page: number;
  createdAt: string;
}

export type NoteColor = "yellow" | "green" | "blue" | "pink" | "purple";

export interface ReaderNote extends ReaderBookmark {
  selectedText: string;
  note: string;
  color?: NoteColor;
}

export interface ContinueReadingEntry {
  userId: number | null;
  bookId?: number | null;
  bookSlug: string;
  bookTitle: string;
  bookCoverImage?: string | null;
  chapterSlug?: string | null;
  chapterTitle?: string | null;
  page: number;
  updatedAt: string;
  accessType?: string;
  price?: string | number | null;
}

export type ReaderReadMode = "paged" | "scroll";

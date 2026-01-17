export interface Chapter {
  id: number;
  title: string;
  content: string;
  book_id: number;
  chapter_number: number;
  createdAt: string;
  updatedAt: string;
  view_count?: number;
}

export interface ChapterBase {
  id: number;
  book_id: number;
  title?: string;
  content: string;
  chapter_number: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface ChapterStats {
  guestViews?: number;
  todayViews?: number;
  //   result?: any;
}

export interface ChapterWithStats extends Chapter {
  stats: ChapterStats;
}

export interface ViewResult {
  success: boolean;
  totalViews?: number;
  dailyViews?: number;
  guestViews?: number;
  isNewView?: boolean;
  error?: string;
  message?: string;
}

export interface ViewHistoryItem {
  date: string;
  views: number;
}

export interface TopChapter {
  rank: number;
  chapterId: string;
  views: number;
}

export interface ChapterUploadProps {
  book_id: number;
  title: string;
  chapter_number: number;
  content: string;
}

export interface ChapterCardProps {
  id: number;
  title: string;
  order: number;
  slug: string;
  is_viewed?: boolean;
  book_id?: number;
  view_count?: number;
  createdAt?: string | Date;
  updatedAt?: string;
  audio?: {
    duration: number;
  };
}
export interface ChapterContent {
  id: number;
  bookId: number;
  title: string;
  order: number;
  slug: string;
  contentUrl: string;
  hasAccess: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BookNewChapterCard {
  book_id: number;
  book_name: string;
  chapters: ChapterCardProps[];
}

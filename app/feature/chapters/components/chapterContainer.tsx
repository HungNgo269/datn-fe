"use client";

import { ChapterCardProps } from "../types/chapter.type";
import { ChapterList } from "./chapterList";
import { ChapterTabs } from "./chapterTab";
interface ChapterContainerProps {
  bookId: number;
  chapters: ChapterCardProps[];
  totalChapters?: number;
  freeChapters?: number;
  accessType?: string;
  showMoreText?: string;
  initialVisibleChapters?: number;
  isPurchased?: boolean;
  isSubscribed?: boolean;
  bookTitle: string;
  bookCoverImage: string;
  bookSlug: string;
}

export function ChapterContainer(props: ChapterContainerProps) {
  const { bookId, ...listProps } = props;

  return (
    <ChapterTabs bookId={bookId}>
      <ChapterList {...listProps} />
    </ChapterTabs>
  );
}

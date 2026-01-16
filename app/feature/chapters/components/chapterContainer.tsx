"use client";

import { ChapterCardProps } from "../types/chapter.type";
import { ChapterList } from "./chapterList";
import { ChapterTabs } from "./chapterTab";
interface ChapterContainerProps {
  bookId: number;
  chapters: ChapterCardProps[];
  totalChapters?: number;
  showMoreText?: string;
  initialVisibleChapters?: number;
}

export function ChapterContainer(props: ChapterContainerProps) {
  const { bookId, ...listProps } = props;

  return (
    <ChapterTabs bookId={bookId}>
      <ChapterList {...listProps} />
    </ChapterTabs>
  );
}

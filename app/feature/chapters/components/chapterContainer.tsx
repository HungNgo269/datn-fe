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
  return (
    <ChapterTabs bookId={props.bookId}>
      <ChapterList {...props} />
    </ChapterTabs>
  );
}

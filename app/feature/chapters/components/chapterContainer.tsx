"use client";

import { ChapterCardProps } from "../types/chapter.type";
import { ChapterList } from "./chapterList";
import { ChapterTabs } from "./chapterTab";

interface ChapterContainerProps {
  chapters: ChapterCardProps[];
  totalChapters?: number;
  showMoreText?: string;
  initialVisibleChapters?: number;
}
export function ChapterContainer(props: ChapterContainerProps) {
  return (
    <ChapterTabs>
      <ChapterList {...props} />
    </ChapterTabs>
  );
}

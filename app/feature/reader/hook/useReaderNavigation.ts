import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChapterCardProps } from "@/app/feature/chapters/types/chapter.type";

interface UseReaderNavigationProps {
  chapters: ChapterCardProps[];
  chapterSlug?: string;
  bookSlug?: string;
  nextChapterSlug?: string | null;
}

export function useReaderNavigation({
  chapters,
  chapterSlug,
  bookSlug,
  nextChapterSlug,
}: UseReaderNavigationProps) {
  const router = useRouter();

  const currentChapter = useMemo(() => {
    return chapters.find((chapter) => chapter.slug === chapterSlug);
  }, [chapters, chapterSlug]);

  const currentChapterIndex = useMemo(() => {
    if (!chapterSlug || !chapters.length) return -1;
    return chapters.findIndex((chapter) => chapter.slug === chapterSlug);
  }, [chapterSlug, chapters]);

  const previousChapterSlug = useMemo(() => {
    if (currentChapterIndex > 0) {
      return chapters[currentChapterIndex - 1].slug;
    }
    return null;
  }, [chapters, currentChapterIndex]);

  const fallbackNextChapterSlug = useMemo(() => {
    if (currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1) {
      return chapters[currentChapterIndex + 1].slug;
    }
    return null;
  }, [chapters, currentChapterIndex]);

  const resolvedNextChapterSlug = nextChapterSlug ?? fallbackNextChapterSlug;

  const navigateToChapter = useCallback(
    (targetSlug: string | null | undefined) => {
      if (!bookSlug) return;
      if (targetSlug) {
        router.push(`/books/${bookSlug}/chapter/${targetSlug}`);
      } else {
        router.push(`/books/${bookSlug}`);
      }
    },
    [bookSlug, router]
  );

  const goToNextChapter = useCallback(() => {
    navigateToChapter(resolvedNextChapterSlug);
  }, [navigateToChapter, resolvedNextChapterSlug]);

  const goToPreviousChapter = useCallback(() => {
    navigateToChapter(previousChapterSlug);
  }, [navigateToChapter, previousChapterSlug]);

  const handleBackToBook = useCallback(() => {
    if (bookSlug) {
      router.push(`/books/${bookSlug}`);
    }
  }, [bookSlug, router]);

  const handleChapterClick = useCallback(
    (slug: string) => {
      if (bookSlug) {
        router.push(`/books/${bookSlug}/chapter/${slug}`);
      }
    },
    [bookSlug, router]
  );

  return {
    currentChapter,
    currentChapterTitle: currentChapter?.title ?? null,
    resolvedNextChapterSlug,
    previousChapterSlug,
    goToNextChapter,
    goToPreviousChapter,
    handleBackToBook,
    handleChapterClick,
  };
}

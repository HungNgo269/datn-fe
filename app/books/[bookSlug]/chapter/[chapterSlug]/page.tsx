import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getChaptersDetails,
  getChaptersOfBook,
} from "@/app/feature/chapters/actions/chapters.actions";
import IframeBookReader from "@/app/feature/reader/components/IframeBookReader";
import { getBookBySlugAction } from "@/app/feature/books/action/books.action";
import { ChapterAccessGuard } from "@/app/feature/chapters/components/ChapterAccessGuard";

type PageProps = {
  params: Promise<{
    bookSlug: string;
    chapterSlug: string;
  }>;
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookSlug: string; chapterSlug: string }>;
}): Promise<Metadata> {
  const { bookSlug, chapterSlug } = await params;

  try {
    const [book, chapter] = await Promise.all([
      getBookBySlugAction(bookSlug),
      getChaptersDetails(bookSlug, chapterSlug),
    ]);
    const bookTitle = book?.title;
    const chapterTitle = chapter?.title;

    if (chapterTitle && bookTitle) {
      return { title: `${chapterTitle} - ${bookTitle} | NextBook` };
    }
    if (chapterTitle) {
      return { title: `${chapterTitle} | NextBook` };
    }
    if (bookTitle) {
      return { title: `${bookTitle} | NextBook` };
    }
  } catch {
    // Fall through to default title.
  }
  return { title: "Read Chapter | NextBook" };
}

export default async function ChapterPage({ params }: PageProps) {
  const { bookSlug, chapterSlug } = await params;

  const [response, chapters, book] = await Promise.all([
    getChaptersDetails(bookSlug, chapterSlug),
    getChaptersOfBook(bookSlug),
    getBookBySlugAction(bookSlug),
  ]);

  const currentChapterIndex = chapters.findIndex(
    (ch) => ch.slug === chapterSlug,
  );
  const currentChapter = chapters[currentChapterIndex];
  const nextChapter =
    currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1
      ? chapters[currentChapterIndex + 1]
      : null;

  return (
    <ChapterAccessGuard
      hasAccess={response.hasAccess}
      bookTitle={book?.title ?? "Unknown Book"}
      bookCoverImage={book?.coverImage ?? ""}
      bookSlug={bookSlug}
      chapterTitle={response.title}
      chapterOrder={currentChapter?.order || response.order}
      accessType={book?.accessType}
      bookId={book?.id}
      chapterPrice={book?.price}
    >
      <div className="h-screen w-screen bg-background">
        <Suspense
          fallback={<div className="h-screen w-screen bg-background" />}
        >
          <IframeBookReader
            initialHtml=""
            title={response.title}
            contentUrl={response.contentUrl}
            bookSlug={bookSlug}
            chapterSlug={chapterSlug}
            chapters={chapters}
            currentChapterOrder={currentChapter?.order || response.order}
            nextChapterSlug={nextChapter?.slug || null}
            bookTitle={book?.title ?? response.title}
            bookCoverImage={book?.coverImage ?? null}
            bookId={book?.id ?? null}
            isLocked={!response.hasAccess}
          />
        </Suspense>
      </div>
    </ChapterAccessGuard>
  );
}

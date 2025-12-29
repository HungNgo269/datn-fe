import {
  getChaptersContent,
  getChaptersDetails,
  getChaptersOfBook,
} from "@/app/feature/chapters/actions/chapters.actions";
import IframeBookReader from "@/app/feature/reader/components/IframeBookReader";
import { getBookBySlug } from "@/app/feature/books/action/books.action";
import { redirect } from "next/navigation";
import Cookies from "js-cookie";

type PageProps = {
  params: Promise<{
    bookSlug: string;
    chapterSlug: string;
  }>;
};

export default async function ChapterPage({ params }: PageProps) {
  const accessToken = Cookies.get("accessToken");
  const { bookSlug, chapterSlug } = await params;

  const [response, chapters, book] = await Promise.all([
    getChaptersDetails(bookSlug, chapterSlug),
    getChaptersOfBook(bookSlug),
    getBookBySlug(bookSlug),
  ]);

  const chapterPath = `/books/${bookSlug}/chapter/${chapterSlug}`;
  if (!response.hasAccess) {
    if (accessToken) {
      redirect(`/payment?book=${bookSlug}&chapter=${chapterSlug}`);
    }
    redirect(`/login?next=${encodeURIComponent(chapterPath)}`);
  }

  if (!response.contentUrl) {
    throw new Error("KhA'ng t §œi Ž`’ø ¯œc n ¯'i dung ch’ø’­ng nAÿy.");
  }

  const chapterContent = await getChaptersContent(response.contentUrl);

  const currentChapterIndex = chapters.findIndex(
    (ch) => ch.slug === chapterSlug
  );
  const currentChapter = chapters[currentChapterIndex];
  const nextChapter =
    currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1
      ? chapters[currentChapterIndex + 1]
      : null;

  return (
    <div className="h-screen w-screen bg-background">
      <IframeBookReader
        initialHtml={chapterContent}
        title={response.title}
        bookSlug={bookSlug}
        chapterSlug={chapterSlug}
        chapters={chapters}
        currentChapterOrder={currentChapter?.order || response.order}
        nextChapterSlug={nextChapter?.slug || null}
        bookTitle={book?.title ?? response.title}
        bookCoverImage={book?.coverImage ?? null}
        bookId={book?.id ?? null}
      />
    </div>
  );
}

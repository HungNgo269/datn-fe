import {
  getChaptersContent,
  getChaptersDetails,
  getChaptersOfBook,
} from "@/app/feature/chapters/actions/chapters.actions";
import IframeBookReader from "@/app/feature/reader/components/IframeBookReader";

type PageProps = {
  params: Promise<{
    bookSlug: string;
    chapterSlug: string;
  }>;
};

export default async function ChapterPage({ params }: PageProps) {
  const { bookSlug, chapterSlug } = await params;

  const [response, chapters] = await Promise.all([
    getChaptersDetails(bookSlug, chapterSlug),
    getChaptersOfBook(bookSlug),
  ]);

  const chapterContent = await getChaptersContent(response.contentUrl);
  
  const currentChapterIndex = chapters.findIndex(
    (ch) => ch.slug === chapterSlug
  );
  const currentChapter = chapters[currentChapterIndex];
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1 
    ? chapters[currentChapterIndex + 1] 
    : null;

  return (
    <div className="h-screen w-screen bg-gray-900">
      <IframeBookReader 
        initialHtml={chapterContent} 
        title={response.title}
        bookSlug={bookSlug}
        chapterSlug={chapterSlug}
        chapters={chapters}
        currentChapterOrder={currentChapter?.order || response.order}
        nextChapterSlug={nextChapter?.slug || null}
      />
    </div>
  );
}

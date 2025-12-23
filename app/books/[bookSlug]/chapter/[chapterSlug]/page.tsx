import {
  getChaptersContent,
  getChaptersDetails,
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

  const response = await getChaptersDetails(bookSlug, chapterSlug);

  if (!response) return <div>Lỗi...</div>;

  const chapterContent = await getChaptersContent(response.contentUrl);
  return (
    <div className="h-screen w-screen bg-gray-900">
      <IframeBookReader initialHtml={chapterContent} title={response.title} />
    </div>
  );
}

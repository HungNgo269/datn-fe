import { getChaptersDetails } from "@/app/feature/chapters/actions/chapters.actions";
import { EditChapterClient } from "./components/editChapterClient";

interface EditChapterPageProps {
  params: Promise<{
    slug: string;
    chapterSlug: string;
  }>;
}

export default async function EditChapterPage({ params }: EditChapterPageProps) {
  const { slug, chapterSlug } = await params;
  const chapterData = await getChaptersDetails(slug, chapterSlug);

  if (!chapterData) {
    return <div>Không tìm thấy chương.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Chỉnh sửa chương</h3>
        <p className="text-sm text-muted-foreground">
          Cập nhật thông tin cho chương này.
        </p>
      </div>
      <EditChapterClient initialData={chapterData} bookSlug={slug} chapterSlug={chapterSlug} />
    </div>
  );
}

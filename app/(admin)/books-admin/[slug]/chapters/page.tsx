import Link from "next/link";
import { Plus } from "lucide-react";
import { getChaptersOfBook } from "@/app/feature/chapters/actions/chapters.actions";
import { AdminChapterList } from "@/app/feature/chapters/components/adminChapterList";
import { Button } from "@/components/ui/button";

interface ChapterListPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ChapterListPage({ params }: ChapterListPageProps) {
  const { slug } = await params;
  const chapters = await getChaptersOfBook(slug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 relative overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Quản lý chương</h1>
            <p className="text-slate-600">
              Quản lý danh sách chương cho cuốn sách này
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/books-admin">
              <Button variant="outline" className="bg-white hover:bg-slate-100">Quay lại</Button>
            </Link>
            <Link href={`/books-admin/${slug}/chapters/create`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm chương
              </Button>
            </Link>
          </div>
        </div>

        <AdminChapterList chapters={chapters} bookSlug={slug} />
      </div>
    </div>
  );
}

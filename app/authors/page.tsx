import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/app/share/components/ui/header/header";
import FooterComponent from "@/app/share/components/ui/footer/footer";
import { HeaderSkeleton } from "@/app/share/components/ui/skeleton/skeleton";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import AuthorGrid from "@/app/feature/author/components/authorGrid";
import { getAuthorsAction } from "@/app/feature/author/actions/authors.actions";

const AUTHORS_PER_PAGE = 12;

export const metadata: Metadata = {
  title: { absolute: "Danh sách tác giả | NextBook" },
  description:
    "Khám phá các tác giả nổi bật trên NextBook và những tác phẩm gắn liền với tên tuổi của họ.",
};

interface AuthorsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || AUTHORS_PER_PAGE;

  const { data: authors, meta } = await getAuthorsAction({ page, limit });

  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto w-full">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>
      </header>

      <main className="mx-auto mt-20 w-full px-3 md:w-[700px] lg:w-[950px] xl:w-[1190px] lg:px-0">
        <section className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary/80">
              Đội ngũ tác giả
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Những cây bút truyền cảm hứng
            </h1>
            <p className="mt-2 text-muted-foreground">
              Dõi theo các tác giả yêu thích, đọc tiểu sử của họ và tìm toàn bộ
              tác phẩm đã xuất bản trên thư viện NextBook.
            </p>
          </div>

          <AuthorGrid authors={authors} />

          {meta.totalPages > 1 && (
            <div className="mt-6">
              <Pagination meta={meta} />
            </div>
          )}
        </section>
      </main>

      <div className="w-full">
        <Suspense fallback={<div className="h-40 w-full animate-pulse bg-muted" />}>
          <FooterComponent />
        </Suspense>
      </div>
    </div>
  );
}

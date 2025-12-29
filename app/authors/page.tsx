import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/app/share/components/ui/header/header";
import FooterComponent from "@/app/share/components/ui/footer/footer";
import {
  BookListSkeleton,
  TrendingBookSkeleton,
} from "@/app/share/components/ui/skeleton/skeleton";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import AuthorGrid from "@/app/feature/author/components/authorGrid";
import { getAuthorsAction } from "@/app/feature/author/actions/authors.actions";
import TrendingBook from "@/app/feature/books-trending/components/trendingBook";
import PopularBook from "@/app/feature/books-popular/components/popularBook";

const AUTHORS_PER_PAGE = 12;

export const metadata: Metadata = {
  title: { absolute: "Danh sách tác giả | NextBook" },
  description:
    "Khám phá kho tác giả đa dạng trên NextBook và tìm những câu chuyện gắn liền với dấu ấn của họ.",
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
      <header className="w-full mx-auto">
        <Header />
      </header>

      <div className="w-full mx-auto mt-20 md:w-[700px] lg:w-[950px] xl:w-[1190px] p-2 lg:p-0">
        <div className="flex justify-between mt-10 flex-col lg:flex-row lg:gap-3 xl:gap-10">
          <div className="flex flex-col gap-5 md:w-[700px] lg:w-[800px] xl:w-[850px]">
            <div className="w-full flex flex-col gap-6  p-4 md:p-6">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary/80">
                  Tìm tác giả yêu thích
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Bộ sưu tập tác giả NextBook
                </h1>
                <p className="text-muted-foreground text-sm md:text-base max-w-3xl">
                  Duyệt qua những cây bút đang được yêu thích nhất, khám phá tác
                  phẩm tiêu biểu, và theo dõi những tác giả mà bạn quan tâm.
                </p>
              </div>

              <Suspense fallback={<BookListSkeleton />}>
                <AuthorGrid authors={authors} />
              </Suspense>

              {meta.totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination meta={meta} />
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-5 w-full lg:w-[250px] xl:w-[300px] mt-10 lg:mt-0">
            <Suspense fallback={<TrendingBookSkeleton />}>
              <TrendingBook period="month" />
            </Suspense>
            <Suspense fallback={<TrendingBookSkeleton />}>
              <PopularBook />
            </Suspense>
          </aside>
        </div>
      </div>

      <div className="w-full">
        <FooterComponent />
      </div>
    </div>
  );
}

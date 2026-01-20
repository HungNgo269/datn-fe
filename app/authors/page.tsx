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

const AUTHORS_PER_PAGE = 15;

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
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <Header />
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">
          
          {/* Main Content */}
          <section className="flex-1 flex flex-col gap-10">
            {/* Page Header */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-primary">
                Discover Creators
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Tác giả
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Những cây bút tài năng đang định hình thế giới văn học tại NextBook.
                Khám phá hành trình và tác phẩm tiêu biểu của họ.
              </p>
            </div>

            <Suspense fallback={<BookListSkeleton />}>
              <AuthorGrid authors={authors} />
            </Suspense>

            {meta.totalPages > 1 && (
              <div className="mt-8 flex justify-center border-t border-border/40 pt-8">
                <Pagination meta={meta} />
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-10">
             {/* Sticky container for sidebar content if needed later */}
             <div className="flex flex-col gap-10 sticky top-[100px]">
              <Suspense fallback={<TrendingBookSkeleton />}>
                <TrendingBook period="month" />
              </Suspense>
              <Suspense fallback={<TrendingBookSkeleton />}>
                <PopularBook />
              </Suspense>
             </div>
          </aside>
        </div>
      </main>

      <div className="mt-auto border-t">
        <FooterComponent />
      </div>
    </div>
  );
}

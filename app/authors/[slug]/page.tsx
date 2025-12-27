import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Header from "@/app/share/components/ui/header/header";
import FooterComponent from "@/app/share/components/ui/footer/footer";
import { HeaderSkeleton } from "@/app/share/components/ui/skeleton/skeleton";
import { BookList } from "@/app/feature/books/components/bookListGrid";
import AuthorProfile from "@/app/feature/author/components/authorProfile";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import { getAuthorBySlugAction } from "@/app/feature/author/actions/authors.actions";
import { getBooksAction } from "@/app/feature/books/action/books.action";
import {
  BookSortBy,
  SortOrder,
} from "@/app/feature/books/types/books.type";

const BOOKS_PER_PAGE = 12;

interface AuthorDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const author = await getAuthorBySlugAction(slug);
    return {
      title: { absolute: `${author.name} | Tác giả trên NextBook` },
      description:
        author.bio ||
        `Khám phá các tác phẩm nổi bật của tác giả ${author.name} trên NextBook.`,
    };
  } catch {
    return {
      title: { absolute: "Tác giả không tồn tại | NextBook" },
    };
  }
}

export default async function AuthorDetailPage({
  params,
  searchParams,
}: AuthorDetailPageProps) {
  const { slug } = await params;
  let author: Awaited<ReturnType<typeof getAuthorBySlugAction>>;

  try {
    author = await getAuthorBySlugAction(slug);
  } catch (error) {
    notFound();
  }

  const resolvedSearch = await searchParams;
  const page = Number(resolvedSearch.page) || 1;
  const limit = Number(resolvedSearch.limit) || BOOKS_PER_PAGE;

  const { data: books, meta } = await getBooksAction({
    page,
    limit,
    author: slug,
    sortBy: BookSortBy.CREATED_AT,
    sortOrder: SortOrder.DESC,
  });

  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto w-full">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>
      </header>

      <main className="mx-auto mt-20 flex w-full flex-col gap-10 px-3 md:w-[700px] lg:w-[950px] xl:w-[1190px] lg:px-0">
        <AuthorProfile author={author} bookCount={meta.total} />

        <section
          id="books"
          className="flex flex-col gap-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold md:text-2xl">
              Tác phẩm nổi bật
            </h2>
            <p className="text-sm text-muted-foreground">
              Có tổng cộng{" "}
              <strong className="text-foreground">{meta.total}</strong>{" "}
              {meta.total === 1 ? "đầu sách" : "đầu sách"} được xuất bản bởi{" "}
              <span className="font-medium text-foreground">
                {author.name}
              </span>
            </p>
          </div>

          <BookList books={books} />

          {meta.totalPages > 1 && (
            <div className="mt-6">
              <Pagination meta={meta} hashUrl="books" />
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

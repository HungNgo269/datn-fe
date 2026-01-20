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
import { BookSortBy, SortOrder } from "@/app/feature/books/types/books.type";

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
      title: `${author.name} | NextBook`,
      description: author.bio || undefined,
    };
  } catch {
    return {
      title: "Author | NextBook",
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
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <Header />
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="mx-auto max-w-5xl flex flex-col gap-16">
          <AuthorProfile author={author} bookCount={meta.total} />

          <section id="books" className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 border-b border-border/40 pb-4">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Tác phẩm tiêu biểu
              </h2>
              <p className="text-base text-muted-foreground">
                Danh sách các đầu sách được xuất bản bởi {author.name}
              </p>
            </div>

            <BookList books={books} />

            {meta.totalPages > 1 && (
              <div className="mt-8 flex justify-center border-t border-border/40 pt-8">
                <Pagination meta={meta} hashUrl="books" />
              </div>
            )}
          </section>
        </div>
      </main>

      <div className="mt-auto border-t">
        <FooterComponent />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { ReactNode } from "react";

// Imports từ BookPage & Share
import Header from "../share/components/ui/header/header";
import FooterComponent from "../share/components/ui/footer/footer";
import {
  HeaderSkeleton,
  TrendingBookSkeleton,
} from "../share/components/ui/skeleton/skeleton";
import TrendingBook from "../feature/books-trending/components/trendingBook";
import PopularBook from "../feature/books-popular/components/popularBook";

import { getBooksAction } from "../feature/books/action/books.action";
import { Book } from "../feature/books/types/books.type";
import { searchAuthorsAction } from "../feature/author/actions/authors.actions";
import { AuthorInfo } from "../feature/author/types/authors.types";
import { getURL } from "@/lib/helper";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";
import { cn } from "@/lib/utils";

const SEARCH_PAGE_TITLE = "Tìm kiếm sách & tác giả | NextBook";

const SEARCH_PAGE_DESCRIPTION =
  "Tìm kiếm sách hoặc tác giả trong thư viện NextBook và truy cập nhanh những câu chuyện phù hợp với sở thích của bạn.";

const SEARCH_PAGE_URL = getURL("search");

export const metadata: Metadata = {
  title: { absolute: SEARCH_PAGE_TITLE },
  description: SEARCH_PAGE_DESCRIPTION,
  alternates: { canonical: SEARCH_PAGE_URL },
  openGraph: {
    url: SEARCH_PAGE_URL,
    title: SEARCH_PAGE_TITLE,
    description: SEARCH_PAGE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SEARCH_PAGE_TITLE,
    description: SEARCH_PAGE_DESCRIPTION,
  },
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

const BOOK_RESULT_LIMIT = 12;
const AUTHOR_RESULT_LIMIT = 6;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() ?? "";

  const [bookResults, authorResults] = await Promise.all([
    query
      ? getBooksAction({ search: query, limit: BOOK_RESULT_LIMIT, page: 1 })
      : Promise.resolve(null),
    query
      ? searchAuthorsAction({
          query,
          limit: AUTHOR_RESULT_LIMIT,
          page: 1,
        })
      : Promise.resolve(null),
  ]);

  const books = bookResults?.data ?? [];
  const authors = authorResults?.data ?? [];

  return (
    <div className="overflow-x-hidden">
      <header className="ml-auto mr-auto w-full">
        <Header />
      </header>

      <div className="w-full mx-auto mt-20 md:w-[700px] lg:w-[950px] xl:w-[1190px] p-2 lg:p-0">
        <div className="flex justify-between mt-10 lg:flex-row flex-col lg:gap-3 xl:gap-10">
          <div className="md:w-[700px] lg:w-[800px] xl:w-[850px] flex flex-col gap-5">
            <div className="mx-auto w-full lg:w-[1190px] p-2">
              <div className="flex justify-between">
                <div className="w-full lg:w-[850px] flex flex-col gap-8">
                  {query ? (
                    <>
                      <ResultSection
                        title="Tác giả"
                        count={authors.length}
                        emptyMessage=""
                        hideIfEmpty={true}
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          {authors.map((author) => (
                            <AuthorResultCard
                              key={author.id}
                              author={author}
                              query={query}
                            />
                          ))}
                        </div>
                      </ResultSection>

                      <ResultSection
                        title="Sách"
                        count={books.length}
                        emptyMessage="Không tìm thấy cuốn sách nào phù hợp"
                        hideIfEmpty={false}
                      >
                        {books.length > 0 ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {books.map((book) => (
                              <BookResultCard
                                key={book.id}
                                book={book}
                                query={query}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="py-10 text-center text-muted-foreground bg-muted/30 rounded-xl">
                            No books found matching {query}.
                          </div>
                        )}
                      </ResultSection>

                      {books.length === 0 && authors.length === 0 && (
                        <div className="text-center py-20">
                          <p className="text-lg text-muted-foreground">{`Không có cuốn sách hay tác giả phù hợp nào`}</p>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-[200px] md:w-[250px] xl:w-[300px] gap-5 mt-10 lg:mt-0">
            <Suspense fallback={<TrendingBookSkeleton />}>
              <TrendingBook period={"month"} />
            </Suspense>
            <Suspense fallback={<TrendingBookSkeleton />}>
              <PopularBook />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="w-full mt-20">
        <Suspense
          fallback={<div className="h-40 w-full bg-muted animate-pulse" />}
        >
          <FooterComponent />
        </Suspense>
      </div>
    </div>
  );
}

function ResultSection({
  title,
  count,
  children,
  emptyMessage,
  hideIfEmpty = false,
}: {
  title: string;
  count: number;
  children: ReactNode;
  emptyMessage: string;
  hideIfEmpty?: boolean;
}) {
  if (count === 0 && hideIfEmpty) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b pb-5">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {count}
          </span>
        </h2>
      </div>
      {count > 0 ? (
        children
      ) : (
        <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
      )}
    </section>
  );
}

function BookResultCard({ book, query }: { book: Book; query: string }) {
  const authorNames =
    book.authors?.map((item) => item.author.name).join(", ") || "Unknown";
  const sanitizedDescription = sanitizeRichHtml(book.description);

  return (
    <Link
      href={`/books/${book.slug}`}
      className="flex gap-4  p-4 "
      prefetch={true}
    >
      <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted shadow-sm">
        <Image
          src={book.coverImage || "/images/sachFallback.jpg"}
          alt={book.title}
          fill
          sizes="100px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          <HighlightedText text={book.title} query={query} />
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          Bởi{" "}
          <HighlightedText
            text={authorNames}
            query={query}
            fallback="Unknown"
          />
        </p>

        <div className="mt-1">
          {sanitizedDescription ? (
            <div
              className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Cuốn sách chưa có mô tả
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function AuthorResultCard({
  author,
  query,
}: {
  author: AuthorInfo;
  query: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50">
      <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted border">
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            sizes="56px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-lg font-bold text-muted-foreground">
            {author.name?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <p className="text-base font-semibold leading-tight">
          <HighlightedText text={author.name} query={query} />
        </p>
        <Link
          prefetch={true}
          href={`/books?search=${encodeURIComponent(author.name)}`}
          className="text-xs text-primary hover:underline mt-1"
        >
          Xem các cuốn sách của tác giả này &rarr;
        </Link>
      </div>
    </div>
  );
}

function HighlightedText({
  text,
  query,
  fallback,
  className,
}: {
  text?: string | null;
  query: string;
  fallback?: string;
  className?: string;
}) {
  if (!text) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {fallback ?? "Updating soon"}
      </span>
    );
  }

  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return <span className={className}>{text}</span>;
  }

  const escapedQuery = escapeRegExp(normalizedQuery);
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={`${part}-${index}`} className="font-bold text-primary">
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </span>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

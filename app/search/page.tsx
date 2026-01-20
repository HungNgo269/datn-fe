import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

// Imports from BookPage & Share
import Header from "../share/components/ui/header/header";
import FooterComponent from "../share/components/ui/footer/footer";
import {
  HeaderSkeleton,
  TrendingBookSkeleton,
} from "../share/components/ui/skeleton/skeleton";
import TrendingBookClient from "../feature/books-trending/components/trendingBookClient";
import PopularBook from "../feature/books-popular/components/popularBook";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultSection } from "../feature/search/components/ResultSection";
import { BookResultCard } from "../feature/search/components/BookResultCard";
import { AuthorResultCard } from "../feature/search/components/AuthorResultCard";
import { PremiumBanner } from "@/app/share/components/banner/PremiumBanner";

import { getBooksAction } from "../feature/books/action/books.action";
import { searchAuthorsAction } from "../feature/author/actions/authors.actions";
import { getURL } from "@/lib/helper";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import { HighlightedText } from "../feature/search/components/HighlightedText";

const SEARCH_PAGE_TITLE = "Tìm kiếm sách và tác giả | NextBook";

const SEARCH_PAGE_DESCRIPTION =
  "Tìm kiếm sách hoặc tác giả trong thư viện NextBook và nhanh chóng khám phá những câu chuyện hợp gu của bạn.";
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
    page?: string;
    type?: string;
  }>;
}

const BOOK_RESULT_LIMIT = 6;
const AUTHOR_RESULT_LIMIT = 6;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() ?? "";
  const activeType =
    resolvedParams.type === "books" || resolvedParams.type === "authors"
      ? resolvedParams.type
      : "all";
  const currentPage = Math.max(1, parseInt(resolvedParams.page ?? "1", 10));

  const [bookResults, authorResults] = await Promise.all([
    query
      ? activeType === "authors"
        ? Promise.resolve(null)
        : getBooksAction({
            search: query,
            limit: BOOK_RESULT_LIMIT,
            page: activeType === "books" ? currentPage : 1,
          })
      : Promise.resolve(null),
    query
      ? activeType === "books"
        ? Promise.resolve(null)
        : searchAuthorsAction({
            query,
            limit: AUTHOR_RESULT_LIMIT,
            page: activeType === "authors" ? currentPage : 1,
          })
      : Promise.resolve(null),
  ]);

  const books = bookResults?.data ?? [];
  const authors = authorResults?.data ?? [];
  const bookCount = bookResults?.meta?.total ?? books.length;
  const authorCount = authorResults?.meta?.total ?? authors.length;

  const buildSearchUrl = (type: "all" | "books" | "authors") => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type !== "all") params.set("type", type);
    return `/search?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="w-full max-w-[1200px] mx-auto">
          <Header />
        </div>
      </header>

      <main className="w-full max-w-[1200px] mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 mt-10">
          {/* Left Content - Search Results */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-6">
              <div className="pb-4 border-b border-slate-100">
                <span className="text-sm text-muted-foreground">
                  Kết quả tìm kiếm cho:
                </span>
                <h1 className="text-2xl font-bold mt-1 text-slate-900 break-words">
                  "{query}"
                </h1>
              </div>

              {query ? (
                <Tabs defaultValue={activeType} className="w-full">
                  <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-slate-100 rounded-none gap-8">
                    <TabsTrigger
                      value="all"
                      asChild
                      className="px-0 py-3 rounded-none border-b-2 border-transparent bg-transparent font-medium text-slate-500 hover:text-slate-900 data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 data-[state=active]:shadow-none transition-all"
                    >
                      <Link href={buildSearchUrl("all")}>
                        Tất cả <span className="text-xs ml-1 text-slate-400 font-normal">({bookCount + authorCount})</span>
                      </Link>
                    </TabsTrigger>
                    <TabsTrigger
                      value="books"
                      asChild
                      className="px-0 py-3 rounded-none border-b-2 border-transparent bg-transparent font-medium text-slate-500 hover:text-slate-900 data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 data-[state=active]:shadow-none transition-all"
                    >
                      <Link href={buildSearchUrl("books")}>
                        Sách <span className="text-xs ml-1 text-slate-400 font-normal">({bookCount})</span>
                      </Link>
                    </TabsTrigger>
                    <TabsTrigger
                      value="authors"
                      asChild
                      className="px-0 py-3 rounded-none border-b-2 border-transparent bg-transparent font-medium text-slate-500 hover:text-slate-900 data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 data-[state=active]:shadow-none transition-all"
                    >
                      <Link href={buildSearchUrl("authors")}>
                        Tác giả <span className="text-xs ml-1 text-slate-400 font-normal">({authorCount})</span>
                      </Link>
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-8 space-y-12">
                    {activeType === "all" && (
                      <>
                        <ResultSection
                          id="books"
                          title="Sách"
                          count={bookCount}
                          emptyMessage="Không tìm thấy sách phù hợp"
                          hideIfEmpty={false}
                        >
                          {books.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {books.map((book) => (
                                <BookResultCard
                                  key={book.id}
                                  book={book}
                                  query={query}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg text-sm border border-slate-100">
                              Không tìm thấy sách nào cho "{query}"
                            </div>
                          )}
                        </ResultSection>

                        <ResultSection
                          id="authors"
                          title="Tác giả"
                          count={authorCount}
                          emptyMessage=""
                          hideIfEmpty={true}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {authors.map((author) => (
                              <AuthorResultCard
                                key={author.id}
                                author={author}
                                query={query}
                              />
                            ))}
                          </div>
                        </ResultSection>
                      </>
                    )}

                    {activeType === "books" && (
                      <>
                        <ResultSection
                          id="books"
                          title="Sách"
                          count={bookCount}
                          emptyMessage="Không tìm thấy sách phù hợp"
                          hideIfEmpty={false}
                        >
                           {books.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {books.map((book) => (
                                <BookResultCard
                                  key={book.id}
                                  book={book}
                                  query={query}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg text-sm border border-slate-100">
                              Không tìm thấy sách nào cho "{query}"
                            </div>
                          )}
                        </ResultSection>
                        {(bookResults?.meta?.totalPages ?? 0) > 1 && (
                          <div className="mt-8 pt-4 border-t border-slate-100">
                            <Pagination meta={bookResults!.meta} />
                          </div>
                        )}
                      </>
                    )}

                    {activeType === "authors" && (
                      <>
                        <ResultSection
                          id="authors"
                          title="Tác giả"
                          count={authorCount}
                          emptyMessage="Không tìm thấy tác giả phù hợp"
                          hideIfEmpty={false}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {authors.map((author) => (
                              <AuthorResultCard
                                key={author.id}
                                author={author}
                                query={query}
                              />
                            ))}
                          </div>
                        </ResultSection>
                        {(authorResults?.meta?.totalPages ?? 0) > 1 && (
                          <div className="mt-8 pt-4 border-t border-slate-100">
                            <Pagination meta={authorResults!.meta} hashUrl="authors" />
                          </div>
                        )}
                      </>
                    )}

                    {!books.length && !authors.length && (
                      <div className="text-center py-32">
                        <p className="text-slate-400">Không tìm thấy kết quả nào</p>
                      </div>
                    )}
                  </div>
                </Tabs>
              ) : null}
            </div>
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 space-y-8">
            {/* Banner - Functional Component */}
            <PremiumBanner />

            <div className="space-y-8 sticky top-24">
              <Suspense fallback={<TrendingBookSkeleton />}>
                <TrendingBookClient period={"month"} />
              </Suspense>
              <Suspense fallback={<TrendingBookSkeleton />}>
                <PopularBook />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full mt-auto border-t">
        <Suspense fallback={<div className="h-40 w-full bg-slate-50" />}>
          <FooterComponent />
        </Suspense>
      </footer>
    </div>
  );
}

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
    <div className="overflow-x-hidden">
      <header className="ml-auto mr-auto w-full">
        <Header />
      </header>

      <div className="w-full mx-auto mt-20 md:w-[700px] lg:w-[950px] xl:w-[1190px] p-2 lg:p-0">
        <div className="flex justify-between mt-10 lg:flex-row flex-col lg:gap-3 xl:gap-10">
          <div className="md:w-[700px] lg:w-[800px] xl:w-[850px] flex flex-col gap-5">
            <div className="mx-auto w-full lg:w-[1190px] p-2">
              <div className="flex justify-between">
                <div className="w-full lg:w-[850px] flex flex-col gap-8 text-black">
                  <span className="font-bold">
                    Kết quả tìm kiếm cho:&nbsp;
                    <span className="text-primary">{query}</span>
                  </span>
                  {query ? (
                    <>
                      <Tabs defaultValue={activeType}>
                        <TabsList className="flex flex-wrap items-center  border-0 border-b p-0 h-auto">
                          <TabsTrigger
                            value="all"
                            asChild
                            className="rounded-none border-b-2 border-transparent px-4 pb-2 text-sm font-semibold text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-primary hover:text-foreground"
                          >
                            <Link href={buildSearchUrl("all")}>
                              Tất cả ({bookCount + authorCount})
                            </Link>
                          </TabsTrigger>
                          <TabsTrigger
                            value="books"
                            asChild
                            className="rounded-none border-b-2 border-transparent px-4 pb-2 text-sm font-semibold text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-primary hover:text-foreground"
                          >
                            <Link href={buildSearchUrl("books")}>
                              Sách ({bookCount})
                            </Link>
                          </TabsTrigger>
                          <TabsTrigger
                            value="authors"
                            asChild
                            className="rounded-none border-b-2 border-transparent px-4 pb-2 text-sm font-semibold text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-primary hover:text-foreground"
                          >
                            <Link href={buildSearchUrl("authors")}>
                              Tác giả ({authorCount})
                            </Link>
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>

                      {activeType === "all" && (
                        <>
                          <ResultSection
                            id="books"
                            title="Sách"
                            count={bookCount}
                            emptyMessage="Không có kết quả, thử tìm kiếm với từ khóa khác"
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
                                Không có cuốn sách nào phù hợp với {query}.
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
                        </>
                      )}

                      {activeType === "books" && (
                        <>
                          <ResultSection
                            id="books"
                            title="Sách"
                            count={bookCount}
                            emptyMessage="Hãy thử tìm kiếm với từ khóa khác"
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
                                Không có cuốn sách nào phù hợp với {query}.
                              </div>
                            )}
                          </ResultSection>
                          {bookResults?.meta &&
                            bookResults.meta.totalPages > 1 && (
                              <div className="pt-2">
                                <Pagination
                                  meta={bookResults.meta}
                                  // hashUrl="books"
                                />
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
                            emptyMessage="Hãy thử tìm kiếm với từ khóa khác"
                            hideIfEmpty={false}
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
                          {authorResults?.meta &&
                            authorResults.meta.totalPages > 1 && (
                              <div className="pt-2">
                                <Pagination
                                  meta={authorResults.meta}
                                  hashUrl="authors"
                                />
                              </div>
                            )}
                        </>
                      )}

                      {books.length === 0 && authors.length === 0 && (
                        <div className="text-center py-20">
                          <p className="text-lg text-muted-foreground">
                            Không có kết quả nào
                          </p>
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
              <TrendingBookClient period={"month"} />
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

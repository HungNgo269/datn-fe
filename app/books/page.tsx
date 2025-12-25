import type { Metadata } from "next";
import { Suspense } from "react";
import { getURL } from "@/lib/helper";
import { getBooksAction } from "../feature/books/action/books.action";
import CategoryName from "../feature/categories/components/categoryName";
import CategoryFilter from "../feature/categories/components/categoryFilter";
import SortSelection from "../feature/categories/components/categorySortSelection";
import { BookList } from "../feature/books/components/bookListGrid";
import { Pagination } from "../share/components/ui/pagination/pagination";
import { BookListSkeleton } from "../share/components/ui/skeleton/skeleton";
import FooterComponent from "../share/components/ui/footer/footer";
import PopularBook from "../feature/books-popular/components/popularBook";
import TrendingBook from "../feature/books-trending/components/trendingBook";
import {
  AccessType,
  BookSortBy,
  SortOrder,
} from "../feature/books/types/books.type";
import Header from "../share/components/ui/header/header";

const BOOK_PAGE_TITLE = "Discover Stories & Novels | NextBook";

const BOOK_PAGE_DESCRIPTION =
  "Browse reader favorites, trending novels, and new releases across the full NextBook library.";

const BOOK_PAGE_URL = getURL("book");

const BOOK_PAGE_IMAGE = getURL("hero-desktop.png");

export const metadata: Metadata = {
  title: { absolute: BOOK_PAGE_TITLE },

  description: BOOK_PAGE_DESCRIPTION,

  keywords: [
    "NextBook library",

    "online novels",

    "light novels",

    "fantasy books",

    "romance updates",
  ],

  alternates: {
    canonical: BOOK_PAGE_URL,
  },

  openGraph: {
    url: BOOK_PAGE_URL,

    title: BOOK_PAGE_TITLE,

    description: BOOK_PAGE_DESCRIPTION,

    type: "website",

    images: [
      {
        url: BOOK_PAGE_IMAGE,

        width: 1200,

        height: 630,

        alt: "Explore the NextBook library",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: BOOK_PAGE_TITLE,

    description: BOOK_PAGE_DESCRIPTION,

    images: [BOOK_PAGE_IMAGE],
  },

  robots: { index: true, follow: true },
};
interface BookPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    accessType?: string;
    maxPrice?: string;
    minPrice?: string;
    limit?: string;
  }>;
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams.page) || 1;
  const limit = Number(resolvedParams.limit) || 10;

  const sortBy = (resolvedParams.sortBy as BookSortBy) || BookSortBy.CREATED_AT;
  const sortOrder = (resolvedParams.sortOrder as SortOrder) || SortOrder.DESC;
  const accessType = resolvedParams.accessType as AccessType | undefined;
  const categorySlug = resolvedParams.category;
  const search = resolvedParams.search;

  const { data: books, meta } = await getBooksAction({
    page,
    limit,
    category: categorySlug,
    sortBy,
    sortOrder,
    accessType,
    search,
    minPrice: resolvedParams.minPrice
      ? Number(resolvedParams.minPrice)
      : undefined,
    maxPrice: resolvedParams.maxPrice
      ? Number(resolvedParams.maxPrice)
      : undefined,
  });

  return (
    <div className="overflow-x-hidden ">
      <header className="ml-auto mr-auto w-full  ">
        <Suspense>
          <Header></Header>
        </Suspense>
      </header>{" "}
      <div className="w-full mx-auto mt-20 md:w-[700px] lg:w-[950px]  xl:w-[1190px] p-2 lg:p-0 ">
        <div className="flex  justify-between mt-10 lg:flex-row flex-col lg:gap-3 xl:gap-10">
          <div className="md:w-[700px] lg:w-[800px] xl:w-[850px]  flex flex-col gap-5">
            <div className="mx-auto w-full lg:w-[1190px] p-2">
              <div className="flex justify-between">
                <div className="w-full lg:w-[850px] flex flex-col gap-5">
                  <CategoryName currentSlug={categorySlug} />
                  <div className="flex flex-col sm:flex-row justify-between ">
                    <CategoryFilter currentCategory={categorySlug!} />
                    <SortSelection currentSort={sortBy} />
                  </div>
                  <div className="flex flex-col min-h-[500px]">
                    <Suspense fallback={<BookListSkeleton />}>
                      <BookList books={books} />
                    </Suspense>
                    <div className="mt-10 flex w-full justify-center">
                      <Pagination meta={meta} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full ">
        <Suspense>
          <FooterComponent></FooterComponent>
        </Suspense>
      </div>
    </div>
  );
}

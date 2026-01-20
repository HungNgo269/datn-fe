import type { Metadata } from "next";
import { Suspense } from "react";
import { getURL } from "@/lib/helper";
import { getBooksAction } from "../feature/books/action/books.action";
import CategoryName from "../feature/categories/components/categoryName";
import CategoryFilter from "../feature/categories/components/categoryFilter";
import SortSelection from "../feature/categories/components/categorySortSelection";
import { BookList } from "../feature/books/components/bookListGrid";
import { Pagination } from "../share/components/ui/pagination/pagination";
import {
  BookListSkeleton,
  HeaderSkeleton,
  TrendingBookSkeleton,
} from "../share/components/ui/skeleton/skeleton";
import FooterComponent from "../share/components/ui/footer/footer";
import {
  AccessType,
  BookSortBy,
  SortOrder,
} from "../feature/books/types/books.type";
import Header from "../share/components/ui/header/header";
import { getCategories } from "../feature/categories/actions/categories.action";
import PopularBook from "../feature/books-popular/components/popularBook";
import TrendingBook from "../feature/books-trending/components/trendingBook";
import { PremiumBanner } from "@/app/share/components/banner/PremiumBanner";
const BOOK_PAGE_TITLE = "Khám phá truyện & tiểu thuyết | NextBook";

const BOOK_PAGE_DESCRIPTION =
  "Khám phá các truyện được yêu thích, tiểu thuyết thịnh hành và những bản phát hành mới nhất trong thư viện NextBook.";

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
    author?: string;
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
  const author = resolvedParams.author;

  const categories = await getCategories(1, 10);
  const { data: books, meta } = await getBooksAction({
    page,
    limit,
    author,
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
        <Header />
      </header>{" "}
      <div className="w-full max-w-[1190px] mx-auto mt-20 px-4 lg:px-0">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-10 mt-10">
          {/* Main Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            <CategoryName currentSlug={categorySlug} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CategoryFilter
                currentCategory={categorySlug!}
                categories={categories.data}
              />
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

          {/* Sidebar - Stacks below on mobile, beside on lg+ */}
          <div className="w-full lg:w-[250px] xl:w-[300px] flex-shrink-0 flex flex-col gap-5 mt-10">
            <PremiumBanner />
            <Suspense fallback={<TrendingBookSkeleton />}>
              <TrendingBook period={"month"} />
            </Suspense>
            <Suspense fallback={<TrendingBookSkeleton />}>
              <PopularBook />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="w-full ">
        <FooterComponent />
      </div>
    </div>
  );
}

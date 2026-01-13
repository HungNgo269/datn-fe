import { Suspense } from "react";
import Header from "./share/components/ui/header/header";
import CategoryBookWrapper from "./feature/categories/components/categoryBookWrapper";
import BannerComponent from "./feature/banner/components/bannerHomeSlider";
import NewBookList from "./feature/books-new/components/newBookList";
import PopularBook from "./feature/books-popular/components/popularBook";
import TrendingBook from "./feature/books-trending/components/trendingBook";
import FooterComponent from "./share/components/ui/footer/footer";
import {
  BookListSkeleton,
  CategoryShowcaseSkeleton,
  HeaderSkeleton,
  SlideSkeleton,
  TrendingBookSkeleton,
} from "./share/components/ui/skeleton/skeleton";
import { normalizeTimeFrame } from "@/lib/timeCount";
import SwipperNewBook from "./feature/books-new/components/newBookSwipperWrapper";
import ContinueReadingCarousel from "./feature/books-continue/components/ContinueReadingCarousel";
import RecommendedPersonalBookList from "./feature/books-recommends/components/recommendedPersonalBookList";
import RecommendedSimilarByLastBookWrapper from "./feature/books-recommends/components/RecommendedSimilarByLastBookWrapper";
// import Header from "@/app/ui/user/headerCustomer/headerMain";
// import BestSellerContainer from "@/app/ui/user/books/bestSellerContainer";
// import NewBookList from "@/app/ui/user/books/newBookList";
// import BookRecommend from "@/app/ui/user/books/bookRecommend";
// import MostPopularBook from "@/app/ui/user/ranking/popularBook";
// import FooterComponent from "@/app/ui/user/footer/footerComponent";
// import SectionComponent from "@/app/ui/user/section/section";
// import { HeaderWrapper } from "@/app/ui/user/headerCustomer/headerWrapper";
// import SlideWrapper from "@/app/ui/admin/slides/slideWrapper";
// import NewChapterList from "@/app/ui/user/chapter/newChapterList";
// import Swipper from "@/app/ui/user/swipper/swipper";
// import SwipperNewBook from "@/app/ui/user/swipper/swipperNewBook";
// import SwipperBestSeller from "@/app/ui/user/swipper/swipperBestSeller";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const trendingPeriod = normalizeTimeFrame(
    resolvedSearchParams?.trendingPeriod
  );

  return (
    <div className="overflow-x-hidden ">
      <header className="ml-auto mr-auto w-full  ">
        <Header />
      </header>
      <Suspense fallback={<SlideSkeleton />}>
        <BannerComponent />
      </Suspense>
      <div className="w-full mx-auto mt-10 md:w-[700px] lg:w-[950px]  xl:w-[1190px] p-2 lg:p-0 ">
        <Suspense fallback={<CategoryShowcaseSkeleton />}>
          <CategoryBookWrapper />
        </Suspense>
      </div>
      <div className="w-full mx-auto mt-10 md:w-[700px] lg:w-[950px]  xl:w-[1190px] p-2 lg:p-0 ">
        <div className="flex  justify-between mt-10 lg:flex-row flex-col lg:gap-3 xl:gap-10">
          <div className="md:w-[700px] lg:w-[800px] xl:w-[850px]  flex flex-col gap-5">
            <div className="block md:hidden">
              <Suspense fallback={<BookListSkeleton variant="sm" count={10} />}>
                <SwipperNewBook />
              </Suspense>
            </div>
            <div className="hidden md:block">
              <Suspense fallback={<BookListSkeleton count={10} />}>
                <NewBookList />
              </Suspense>
            </div>

            <ContinueReadingCarousel />

            <Suspense fallback={<BookListSkeleton count={10} />}>
              <RecommendedPersonalBookList />
            </Suspense>
            <RecommendedSimilarByLastBookWrapper></RecommendedSimilarByLastBookWrapper>
          </div>
          <div className="flex flex-col  w-4/5 md:w-[250px] xl:w-[300px] gap-5">
            <Suspense fallback={<TrendingBookSkeleton />}>
              <TrendingBook period={trendingPeriod} />
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

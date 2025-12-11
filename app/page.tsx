import { Suspense } from "react";
import { HeaderWrapper } from "@/app/share/components/ui/header/headerWrapper";
import Header from "./share/components/ui/header/header";
import CategoryBookWrapper from "./feature/categories/components/categoryBookWrapper";
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
//ALL SEO,skeleton created by codex
interface PageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const page = (await searchParams)?.page;
  return (
    <div className="overflow-x-hidden">
      <header className="ml-auto mr-auto w-full  ">
        <Suspense>
          <HeaderWrapper>
            <Header></Header>
          </HeaderWrapper>
        </Suspense>
      </header>
      <div className="w-full mx-auto mt-10 md:w-[700px] lg:w-[950px]  xl:w-[1190px] p-2 lg:p-0 ">
        <div className="hidden md:block">
          <Suspense>
            <CategoryBookWrapper />
          </Suspense>
        </div>
      </div>
      {/* <SlideWrapper />
      <div className="w-full mx-auto mt-10 md:w-[700px] lg:w-[950px]  xl:w-[1190px] p-2 lg:p-0 ">
        <div className="block md:hidden">
          <SwipperBestSeller />
        </div>
        <div className="hidden md:block">
          <Suspense>
            <BestSellerContainer />
          </Suspense>
        </div>

        <div className="flex  justify-between mt-10 lg:flex-row flex-col lg:gap-3 xl:gap-10">
          <div className="md:w-[700px] lg:w-[800px] xl:w-[850px]  flex flex-col gap-5">
            <div className="block md:hidden">
              <SwipperNewBook />
            </div>
            <div className="hidden md:block">
              <NewBookList />
            </div>
            <Suspense>
              <NewChapterList searchParams={page} />
            </Suspense>
            <Suspense>
              <BookRecommend></BookRecommend>
            </Suspense>
          </div>
          <div className="flex flex-col gap-5 w-[200px] md:w-[250px] xl:w-[300px]">
            <MostPopularBook />
          </div>
        </div>
        <div className="hidden sm:block">
          <Suspense>
            <SectionComponent></SectionComponent>
          </Suspense>
        </div>
      </div> */}
      {/* o */}
      <div className="w-full ">
        {/* <Suspense>
          <FooterComponent></FooterComponent>
        </Suspense> */}
      </div>
    </div>
  );
}

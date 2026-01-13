import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import BookCarousel from "../../books-carousel/components/bookCarousel";
import { getRecommendedPersonalBooks } from "../actions/recommendBooks.action";
import Swipper from "@/app/share/components/ui/swipper/swipper";

export default async function RecommendedPersonalBookList() {
  const Books = await getRecommendedPersonalBooks(10);
  return (
    <div className="flex flex-col justify-center items-center gap-2">
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <span className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 block">
          Chúng tôi nghĩ bạn sẽ thích
        </span>
      </div>

      <div className="block md:hidden w-full">
        <Swipper books={Books} showHeader={false} showViewMore={false} />
      </div>
      <div className="hidden md:block w-full">
        <BookCarousel
          variant="sm"
          key="new-book-carousel"
          books={Books}
        ></BookCarousel>
      </div>
    </div>
  );
}

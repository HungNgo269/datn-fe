import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import BookCarousel from "../../books-carousel/components/bookCarousel";
import { getNewBookAction } from "../actions/newBook.action";

export default async function NewBookList() {
  const Books = await getNewBookAction(10);
  console.log("boook", Books);
  return (
    <div className="flex flex-col justify-center items-center gap-4 ">
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <span className="font-bold text-2xl text-start flex-1 min-w-0 truncate ">
          Những đầu sách mới nhất
        </span>
        <ViewMoreButton url="/books"></ViewMoreButton>
      </div>

      <BookCarousel
        variant="sm"
        key="new-book-carousel"
        books={Books}
      ></BookCarousel>
    </div>
  );
}

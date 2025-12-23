import Link from "next/link";
import { BookCardProps } from "../../books/types/books.type";
import ImageCard from "@/app/share/components/ui/image/ImageCard";

type Variant = "lg" | "sm";
const MAP = {
  lg: {
    card: "xl:w-[230px]  lg:w-[170px]  md:w-[130px] w-full h-fit",
    imgWrap:
      "xl:w-[230px] xl:h-[300px] lg:w-[170px] lg:h-[221px] md:w-[130px] h-[207px]  w-full",
    title: "text-md",
    author: "text-sm",
  },
  sm: {
    card: "xl:w-[160px]  lg:w-[130px]  md:w-[130px]  h-fit w-full",
    imgWrap:
      "xl:w-[160px] xl:h-[207px] lg:w-[130px] lg:h-[182px] md:w-[130px] h-[207px] w-full",
    title: "text-sm ",
    author: "text-xs",
  },
} as const;

export default function BookCard({
  book,
  variant = "lg",
}: {
  book: BookCardProps;
  variant?: Variant;
}) {
  const image = MAP[variant];
  return (
    <div className={`flex flex-col ${image.card}`}>
      <Link
        prefetch={true}
        href={`/books/${book.slug}`}
        aria-label={book.title}
      >
        <div
          className={`relative overflow-hidden rounded-[8px] group ${image.imgWrap}`}
        >
          <ImageCard
            bookImage={book.coverImage}
            bookName={book.title}
            key={book.id}
          />
        </div>
      </Link>

      <div className="flex flex-col mt-3 h-fit justify-between">
        <Link
          prefetch={true}
          href={`/books/${book.slug}`}
          aria-label={book.title}
        >
          <span
            className={`line-clamp-1  font-semibold cursor-pointer w-fit hover:underline hover:text-primary ${image.title}`}
          >
            {book.title}
          </span>
        </Link>

        <span
          className={`line-clamp-1 font-medium text-muted-foreground cursor-pointer w-fit hover:underline ${image.author}`}
        >
          {book.authors}
        </span>
        {/* {book?.rating ? (
          <span
            className={`line-clamp-1 font-medium text-muted-foreground cursor-pointer w-fit ${image.author}`}
          >
            Rating: {book?.rating}
          </span>
        ) : (
          ""
        )} */}
      </div>
    </div>
  );
}

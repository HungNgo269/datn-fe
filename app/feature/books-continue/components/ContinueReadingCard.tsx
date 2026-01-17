import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { ContinueReadingEntry } from "@/app/types/book.types";
import Link from "next/link";
import { BookBadge } from "@/app/feature/books-carousel/components/BookBadge";

const CARD_SIZING = {
  wrapper: "xl:w-[160px] lg:w-[130px] md:w-[130px] w-full",
  image:
    "relative overflow-hidden rounded-[8px] xl:w-[160px] xl:h-[207px] lg:w-[130px] lg:h-[182px] md:w-[130px] h-[207px] w-full",
};

export default function HistoryCard({
  entry,
}: {
  entry: ContinueReadingEntry;
}) {
  const bookHref = `/books/${entry.bookSlug}`;
  const chapterHref = entry.chapterSlug
    ? `/books/${entry.bookSlug}/chapter/${entry.chapterSlug}`
    : bookHref;
  return (
    <div className={`flex flex-col ${CARD_SIZING.wrapper}`}>
      <Link prefetch={false} href={bookHref} aria-label={entry.bookTitle}>
        <div className={`group ${CARD_SIZING.image}`}>
          <ImageCard
            bookImage={entry.bookCoverImage || ""}
            bookName={entry.bookTitle}
          />
          
          {/* Add badge */}
          <BookBadge 
            accessType={entry.accessType} 
            price={entry.price}
            size="sm"
          />
        </div>
      </Link>
      <div className="flex flex-col mt-3 h-fit justify-between">
        <Link prefetch={false} href={bookHref} aria-label={entry.bookTitle}>
          <span className="line-clamp-1 font-semibold cursor-pointer w-fit hover:underline hover:text-primary text-sm">
            {entry.bookTitle}
          </span>
        </Link>
        {entry.chapterTitle && (
          <Link
            prefetch={false}
            href={chapterHref}
            className="text-xs text-muted-foreground line-clamp-2 hover:text-primary transition-colors"
          >
            {entry.chapterTitle}
          </Link>
        )}
      </div>
    </div>
  );
}

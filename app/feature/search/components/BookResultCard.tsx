import Image from "next/image";
import Link from "next/link";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";
import type { Book } from "@/app/feature/books/types/books.type";
import { HighlightedText } from "./HighlightedText";

interface BookResultCardProps {
  book: Book;
  query: string;
}

export function BookResultCard({ book, query }: BookResultCardProps) {
  const authorNames =
    book.authors?.map((item) => item.author.name).join(", ") || "Đang cập nhật";
  const sanitizedDescription = sanitizeRichHtml(book.description);

  return (
    <Link
      href={`/books/${book.slug}`}
      className="flex gap-4  p-4 "
      prefetch={true}
    >
      <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted shadow-sm">
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          sizes="100px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          <HighlightedText text={book.title} query={query} />
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          Bởi{" "}
          <HighlightedText
            text={authorNames}
            query={query}
            fallback="Đang cập nhật"
          />
        </p>

        <div className="mt-1">
          {sanitizedDescription ? (
            <div
              className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Chưa có mô tả
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

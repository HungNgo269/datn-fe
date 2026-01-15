import Link from "next/link";
import { BookCardProps } from "../../books/types/books.type";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { Badge } from "@/components/ui/badge";
import { toNumericPrice } from "@/lib/helper";

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
  const priceValue = toNumericPrice(book.price);
  const normalizedAccessType = book.accessType
    ? book.accessType.toString().toUpperCase()
    : undefined;
  const isFreeBook = normalizedAccessType === "FREE";
  const requiresPayment =
    normalizedAccessType === "Sách bán" ||
    normalizedAccessType === "Hội viên" ||
    (!isFreeBook && priceValue > 0);
  const accessBadgeLabel = requiresPayment
    ? normalizedAccessType === "Hội viên"
      ? "MEMBER"
      : "Sách bán"
    : null;
  const badgeClasses =
    normalizedAccessType === "Hội viên"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
  return (
    book && (
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
            {accessBadgeLabel && (
              <Badge
                variant="outline"
                className={`absolute right-2 top-2 z-10 border ${badgeClasses}`}
              >
                {accessBadgeLabel}
              </Badge>
            )}
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

          <div className="flex flex-row items-center overflow-hidden max-w-full">
            <div className="text-xs text-muted-foreground truncate">
              {book.authors &&
                book.authors.map((author, index) => {
                  const slug = author.author.slug;
                  const href = slug
                    ? `/authors/${slug}`
                    : `/books?author=${encodeURIComponent(
                        author.author.name
                      )}&page=1`;
                  return (
                    <span key={author.author.id}>
                      <Link
                        prefetch={true}
                        href={href}
                        className="hover:underline"
                      >
                        {author.author.name}
                      </Link>
                      {index < book.authors.length - 1 && ", "}
                    </span>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    )
  );
}

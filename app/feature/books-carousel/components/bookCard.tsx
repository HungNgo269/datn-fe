import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { toNumericPrice } from "@/lib/helper";
import { BookCardProps } from "../../books/types/books.type";

type Variant = "lg" | "sm";
const MAP = {
  lg: {
    card: "xl:w-[230px] lg:w-[170px] md:w-[130px] w-full h-fit",
    imgWrap:
      "xl:w-[230px] xl:h-[300px] lg:w-[170px] lg:h-[221px] md:w-[130px] h-[207px] w-full",
    title: "text-md",
    author: "text-sm",
  },
  sm: {
    card: "xl:w-[160px] lg:w-[130px] md:w-[130px] h-fit w-full",
    imgWrap:
      "xl:w-[160px] xl:h-[207px] lg:w-[130px] lg:h-[182px] md:w-[130px] h-[207px] w-full",
    title: "text-sm",
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

  const { accessBadgeLabel, badgeClasses } = useMemo(() => {
    const priceValue = toNumericPrice(book.price);
    const normalizedAccessType = book.accessType
      ? book.accessType.toString().toUpperCase()
      : undefined;

    const isFreeBook = normalizedAccessType === "FREE";
    const requiresPayment =
      normalizedAccessType === "PURCHASE" ||
      normalizedAccessType === "MEMBERSHIP" ||
      (!isFreeBook && priceValue > 0);

    const label = requiresPayment
      ? normalizedAccessType === "MEMBERSHIP"
        ? "HỘI VIÊN"
        : "SÁCH BÁN"
      : null;

    const classes =
      normalizedAccessType === "MEMBERSHIP"
        ? "border-sky-200 bg-sky-50 text-sky-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

    return {
      accessBadgeLabel: label,
      badgeClasses: classes,
    };
  }, [book.accessType, book.price]);

  return (
    book && (
      <div className={`flex flex-col ${image.card}`}>
        <Link
          prefetch={false}
          href={`/books/${book.slug}`}
          aria-label={book.title}
        >
          <div className={`relative overflow-hidden rounded-[8px] group ${image.imgWrap}`}>
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

        <div className="mt-3 flex h-fit flex-col justify-between">
          <Link
            prefetch={false}
            href={`/books/${book.slug}`}
            aria-label={book.title}
          >
            <span
              className={`w-fit cursor-pointer line-clamp-1 font-semibold hover:text-primary hover:underline ${image.title}`}
            >
              {book.title}
            </span>
          </Link>

          <div className="flex max-w-full flex-row items-center overflow-hidden">
            <div className="truncate text-xs text-muted-foreground">
              {book.authors &&
                book.authors.map((author, index) => {
                  const slug = author.author.slug;
                  const href = slug
                    ? `/authors/${slug}`
                    : `/books?author=${encodeURIComponent(author.author.name)}&page=1`;
                  return (
                    <span key={author.author.id}>
                      <Link prefetch={false} href={href} className="hover:underline">
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

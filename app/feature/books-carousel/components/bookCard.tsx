import Link from "next/link";
import { BookCardProps } from "../../books/types/books.type";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { BookAccessButton } from "./BookAccessButton";

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const toNumericPrice = (price?: BookCardProps["price"]) => {
  if (typeof price === "number") {
    return price;
  }
  if (typeof price === "string") {
    const parsed = parseFloat(price);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

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
    normalizedAccessType === "PURCHASE" ||
    normalizedAccessType === "MEMBERSHIP" ||
    (!isFreeBook && priceValue > 0);
  const priceLabel = isFreeBook
    ? "FREE"
    : priceValue > 0
    ? formatCurrency(priceValue)
    : normalizedAccessType === "MEMBERSHIP"
    ? "MEMBERSHIP"
    : "PAID";
  const priceBadgeClasses = isFreeBook
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
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
                book.authors.map((author, index) => (
                  <span key={author.author.id}>
                    <Link
                      prefetch={true}
                      href={`${book.viewCount}`}
                      className="hover:underline"
                    >
                      {author.author.name}
                    </Link>
                    {index < book.authors.length - 1 && ", "}
                  </span>
                ))}
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${priceBadgeClasses}`}
            >
              {priceLabel}
            </span>
            <BookAccessButton
              slug={book.slug}
              isFree={isFreeBook}
              priceLabel={priceLabel}
              requiresPayment={requiresPayment}
            />
          </div>
        </div>
      </div>
    )
  );
}

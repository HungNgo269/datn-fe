"use client";

import { useMemo } from "react";
import Link from "next/link";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { toNumericPrice } from "@/lib/helper";
import { BookCardProps } from "../../books/types/books.type";
import { Crown, ShoppingBag } from "lucide-react";

type Variant = "lg" | "sm";

const MAP = {
  lg: {
    card: "xl:w-[220px] lg:w-[160px] md:w-[130px] w-full h-fit",
    imgWrap:
      "xl:w-[220px] xl:h-[300px] lg:w-[160px] lg:h-[221px] md:w-[130px] h-[207px] w-full",
    title: "text-md",
    badge: "px-4 py-1.5 text-[13px]",
  },
  sm: {
    card: "xl:w-[160px] lg:w-[130px] md:w-[130px] h-fit w-full",
    imgWrap:
      "xl:w-[160px] xl:h-[207px] lg:w-[130px] lg:h-[182px] md:w-[130px] h-[207px] w-full",
    title: "text-sm",
    badge: "px-2 py-1 text-[11px]",
  },
} as const;

export default function BookCard({
  book,
  variant = "lg",
}: {
  book: BookCardProps;
  variant?: Variant;
}) {
  const style = MAP[variant];

  const { accessBadgeLabel, isMembership } = useMemo(() => {
    const priceValue = toNumericPrice(book.price);
    const normalizedAccessType = book.accessType?.toString().toUpperCase();

    const isMembership = normalizedAccessType === "MEMBERSHIP";
    const isFree = normalizedAccessType === "FREE";
    const requiresPayment =
      normalizedAccessType === "PURCHASE" || (!isFree && priceValue > 0);

    let label = null;
    if (isMembership) label = "HỘI VIÊN";
    else if (requiresPayment) label = "SÁCH BÁN";

    return { accessBadgeLabel: label, isMembership };
  }, [book.accessType, book.price]);

  return (
    book && (
      <div className={`flex flex-col group pt-2 ${style.card}`}>
        <Link
          prefetch={false}
          href={`/books/${book.slug}`}
          aria-label={book.title}
        >
          <div
            className={`relative rounded-xl shadow-sm transition-transform duration-300 group-hover:-translate-y-2 ${style.imgWrap}`}
          >
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <ImageCard
                bookImage={book.coverImage}
                bookName={book.title}
                key={book.id}
              />
            </div>

            {/* Badge - Top right corner like reference image */}
            {accessBadgeLabel && (
              <div
                className={`
                  absolute top-0 right-0 z-10
                  flex items-center gap-1.5 pl-3 pr-1 py-1
                  rounded-full shadow-sm border border-white/20
                  ${
                    isMembership
                      ? "bg-gradient-to-r from-orange-400 to-amber-600 shadow-orange-500/30"
                      : "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/30"
                  }
                  transition-all duration-300 hover:scale-105 hover:shadow-md
                `}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-white leading-none pt-0.5">
                  {accessBadgeLabel}
                </span>

                <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full shadow-sm">
                  {isMembership ? (
                    <Crown className="w-3 h-3 text-amber-500" strokeWidth={3} />
                  ) : (
                    <ShoppingBag className="w-3 h-3 text-rose-500" strokeWidth={3} />
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>

        <div className="mt-3 flex flex-col gap-1">
          <Link prefetch={false} href={`/books/${book.slug}`}>
            <h3
              className={`font-bold line-clamp-1 transition-colors group-hover:text-primary ${style.title}`}
            >
              {book.title}
            </h3>
          </Link>

          <div className="truncate text-xs text-muted-foreground italic">
            {book.authors?.map((author, index) => (
              <span key={author.author.id}>
                <Link
                  href={`/authors/${author.author.slug}`}
                  className="hover:underline"
                >
                  {author.author.name}
                </Link>
                {index < book.authors.length - 1 && ", "}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  );
}

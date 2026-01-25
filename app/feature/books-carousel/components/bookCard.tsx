"use client";

import { useMemo } from "react";
import Link from "next/link";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { BookCardProps } from "../../books/types/books.type";
import { BookBadge } from "./BookBadge";

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
  ranking,
}: {
  book: BookCardProps;
  variant?: Variant;
  ranking?: number;
}) {
  const style = MAP[variant];

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

            {/* Badge using reusable component */}
            <BookBadge 
              accessType={book.accessType} 
              price={book.price}
              size={variant}
              isOnPromotion={book.isOnPromotion}
              discountPercent={book.discountPercent}
            />

            {/* Ranking number */}
            {ranking && (
              <div className="absolute -bottom-6 left-0 text-5xl md:text-6xl font-black text-foreground" style={{ WebkitTextStroke: '1px white' }}>
                {ranking}
              </div>
            )}
          </div>
        </Link>

        <div className={`flex flex-col gap-1 ${ranking ? 'mt-6' : 'mt-3'}`}>
          <Link prefetch={false} href={`/books/${book.slug}`}>
            <h3
              className={`font-bold line-clamp-1 transition-colors group-hover:text-primary ${style.title}`}
            >
              {book.title}
            </h3>
          </Link>

          <div className="truncate text-xs text-muted-foreground ">
            {book.authors?.map((authorEntry: any, index) => {
              const author = authorEntry.author || authorEntry;

              return (
                <span key={author.id}>
                  <Link
                    href={`/authors/${author.slug}`}
                    className="hover:underline"
                  >
                    {author.name}
                  </Link>
                  {index < book.authors.length - 1 && ", "}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    )
  );
}

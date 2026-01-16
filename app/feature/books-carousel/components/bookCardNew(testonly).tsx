"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Book, BookCardProps } from "../../books/types/books.type";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Heart } from "lucide-react";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

const formatPrice = (price?: number | string | null) => {
  const numericPrice = typeof price === "string" ? Number(price) : price ?? 0;
  if (!numericPrice || Number.isNaN(numericPrice)) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numericPrice);
};

export default function BookCard({
  book,
  variant = "lg",
}: {
  book: Book | BookCardProps;
  variant?: "lg" | "sm";
}) {
  const bookPrice = formatPrice(book.price);
  const isMember = true;

  const overlayOffset = variant === "sm" ? -140 : -200;

  const popupWidth =
    variant === "sm"
      ? "w-[320px] md:w-[380px] lg:w-[420px] md:h-[215px] lg:h-[250px]"
      : "w-[350px] md:w-[420px] lg:w-[480px] md:h-[290px] lg:h-[350px]";

  const popupImageWidth =
    variant === "sm" ? "w-[100px] md:w-[120px]" : "w-[110px] md:w-[140px]";

  const sanitizedContent = useMemo(() => {
    return sanitizeRichHtml(book?.description);
  }, [book?.description]);

  if (!book) return null;

  return (
    <div className="flex w-full flex-col">
      <HoverCard openDelay={0} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Link
            prefetch={false}
            href={`/books/${book.slug}`}
            className="relative w-full cursor-pointer group"
          >
            <div className="overflow-hidden rounded-md shadow-sm transition-all">
              <div className="aspect-[3/4] w-full relative">
                <ImageCard
                  bookImage={book.coverImage}
                  bookName={book.title}
                  key={book.id}
                />
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <h3 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-green-600">
                {book.title}
              </h3>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {book.authors?.map((a) => a.author.name).join(", ")}
              </p>
            </div>
          </Link>
        </HoverCardTrigger>

        <HoverCardContent
          className={`${popupWidth} hidden border-none bg-card p-0 text-card-foreground overflow-visible z-50 md:block`}
          side="right"
          align="start"
          sideOffset={overlayOffset}
          avoidCollisions={false}
        >
          <div
            className="absolute inset-0 z-0 rounded-lg bg-cover bg-center opacity-10 blur-2xl"
            style={{ backgroundImage: `url(${book.coverImage})` }}
          />

          <div className="relative z-10 flex gap-3 p-3 md:gap-4 md:p-4">
            <div
              className={`flex-shrink-0 ${popupImageWidth} overflow-hidden rounded-sm border border-white/10 self-start`}
            >
              <div className="aspect-[3/4] relative">
                <ImageCard bookImage={book.coverImage} bookName={book.title} />
              </div>
            </div>

            <div className="flex min-h-[180px] flex-1 flex-col">
              <div>
                <h4 className="mb-1 max-w-[200px] truncate text-base font-bold leading-tight text-card-foreground line-clamp-2 md:text-xl">
                  {book.title}
                </h4>
                <div className="mb-2 text-xs font-medium text-gray-400 md:text-sm">
                  {book.authors?.map((a) => a.author.name).join(", ")}
                </div>

                <div className="mb-3 flex items-center gap-2">
                  {isMember && (
                    <div className="flex items-center gap-1 rounded border border-[#B48811]/50 bg-[#B48811]/20 px-1.5 py-0.5">
                      <span className="text-[10px] font-bold text-[#FFD700]">
                        HỘI VIÊN
                      </span>
                    </div>
                  )}
                  <span className="rounded border border-green-500/30 bg-green-900/40 px-1.5 py-0.5 text-[10px] font-bold text-green-400">
                    {bookPrice}
                  </span>
                </div>
                {sanitizedContent ? (
                  <div
                    className="prose prose-sm w-full max-w-none break-words text-justify text-foreground leading-relaxed line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có mô tả cho sách này.
                  </p>
                )}
              </div>

              <div className="mt-auto flex items-center gap-2">
                <Link prefetch={false} href={`/books/${book.slug}/read`} className="flex-1">
                  <Button
                    size="sm"
                    className="h-8 w-full bg-primary/80 text-xs font-bold text-primary-foreground shadow-lg transition-transform active:scale-95 hover:bg-primary md:h-9"
                  >
                    <BookOpen className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Đọc ngay</span>
                    <span className="md:hidden">Đọc</span>
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 rounded-full border-white/10 bg-white/5 p-0 text-white hover:bg-white/10 md:h-9 md:w-9"
                >
                  <Headphones className="h-3 w-3 md:h-4 md:w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-gray-400 hover:bg-transparent hover:text-destructive md:h-9 md:w-9"
                >
                  <Heart className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

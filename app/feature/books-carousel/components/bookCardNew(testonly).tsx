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

const formatPrice = (price?: number | null) => {
  if (!price || price === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
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
      ? "w-[320px] md:w-[380px] lg:w-[420px]   md:h-[215px] lg:h-[250px] "
      : "w-[350px] md:w-[420px] lg:w-[480px]   md:h-[290px] lg:h-[350px] ";

  const popupImageWidth =
    variant === "sm" ? "w-[100px] md:w-[120px]" : "w-[110px] md:w-[140px]";

  if (!book) return null;
  const sanitizedContent = sanitizeRichHtml(book?.description);
  return (
    <div className={`flex flex-col w-full `}>
      <HoverCard openDelay={0} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Link
            href={`/books/${book.slug}`}
            className="relative group cursor-pointer w-full"
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
              <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-green-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {book.authors?.map((a) => a.author.name).join(", ")}
              </p>
            </div>
          </Link>
        </HoverCardTrigger>

        <HoverCardContent
          className={`${popupWidth} p-0 border-none 
           bg-card text-card-foreground overflow-visible z-50 hidden md:block`}
          side="right"
          align="start"
          sideOffset={overlayOffset}
          avoidCollisions={false}
        >
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center blur-2xl z-0 rounded-lg"
            style={{ backgroundImage: `url(${book.coverImage})` }}
          />

          <div className="relative z-10 flex gap-3 md:gap-4 p-3 md:p-4">
            <div
              className={`flex-shrink-0 ${popupImageWidth}  rounded-sm overflow-hidden border border-white/10 self-start`}
            >
              <div className="aspect-[3/4] relative">
                <ImageCard bookImage={book.coverImage} bookName={book.title} />
              </div>
            </div>

            <div className="flex flex-col flex-1 min-h-[180px]">
              <div>
                <h4 className="text-base md:text-xl font-bold leading-tight mb-1 text-card-foreground line-clamp-2 max-w-[200px] truncate">
                  {book.title}
                </h4>
                <div className="text-xs md:text-sm text-gray-400 mb-2 font-medium">
                  {book.authors?.map((a) => a.author.name).join(", ")}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {isMember && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#B48811]/20 border border-[#B48811]/50">
                      <span className="text-[10px] font-bold text-[#FFD700]">
                        HỘI VIÊN
                      </span>
                    </div>
                  )}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-500/30">
                    {bookPrice}
                  </span>
                </div>
                {sanitizedContent ? (
                  <div
                    className="prose prose-sm max-w-none text-foreground leading-relaxed w-full break-words text-justify line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có mô tả cho sách này.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <Link href={`/books/${book.slug}/read`} className="flex-1">
                  <Button
                    size="sm"
                    className="w-full bg-primary/80 hover:bg-primary text-primary-foreground font-bold h-8 md:h-9 text-xs shadow-lg transition-transform active:scale-95"
                  >
                    <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden md:inline">Đọc ngay</span>
                    <span className="md:hidden">Đọc</span>
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-8 md:h-9 w-8 md:w-9 p-0 rounded-full"
                >
                  <Headphones className="w-3 h-3 md:w-4 md:h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-red-500 hover:bg-transparent h-8 md:h-9 w-8 md:w-9 p-0"
                >
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

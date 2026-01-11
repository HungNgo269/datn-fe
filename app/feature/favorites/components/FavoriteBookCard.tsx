"use client";

import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { FavoriteResponseDto } from "../types/favorite.type";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface FavoriteBookCardProps {
  favorite: FavoriteResponseDto;
}

export function FavoriteBookCard({ favorite }: FavoriteBookCardProps) {
  const book = favorite.book;

  if (!book) return null;

  return (
    <Link
      prefetch={true}
      href={`/books/${book.slug}`}
      className="group rounded-lg transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="flex flex-col h-full">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg border-b">
          <ImageCard bookImage={book.coverImage || ""} bookName={book.title} />
        </div>

        <div className="flex flex-col flex-1 p-3 gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
              {book.title}
            </h3>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          {book.description && (
            <div
              className="text-xs text-muted-foreground line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: sanitizeRichHtml(book.description),
              }}
            />
          )}

          <div className="mt-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Thêm ngày{" "}
              {new Date(favorite.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

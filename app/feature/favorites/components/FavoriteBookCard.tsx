"use client";

import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { FavoriteResponseDto } from "../types/favorite.type";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

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
      className="group rounded-xl border bg-card transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="flex flex-col h-full">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-xl border-b">
          <ImageCard bookImage={book.coverImage || ""} bookName={book.title} />
        </div>

        <div className="flex flex-col flex-1 p-4 gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
              {book.title}
            </h3>
            <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          {book.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {book.description}
            </p>
          )}

          <div className="mt-auto flex items-center gap-2">
            <Badge className="text-xs font-medium">#{book.slug}</Badge>
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

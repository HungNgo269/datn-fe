"use client";

import Image from "next/image";
import Link from "next/link";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";
import type { AuthorInfo } from "@/app/feature/author/types/authors.types";
import { HighlightedText } from "./HighlightedText";

interface AuthorResultCardProps {
  author: AuthorInfo;
  query: string;
}

export function AuthorResultCard({ author, query }: AuthorResultCardProps) {
  const safeBio = sanitizeRichHtml(author.bio);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50">
      <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted border">
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            sizes="56px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-lg font-bold text-muted-foreground">
            {author.name?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <p className="text-base font-semibold leading-tight">
          <HighlightedText text={author.name} query={query} />
        </p>
        <div className="mt-1 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {safeBio ? (
            <div dangerouslySetInnerHTML={{ __html: safeBio }} />
          ) : (
            <p className="italic">Chưa có mô tả về tác giả này.</p>
          )}
        </div>
        <Link
          prefetch={true}
          href={`/books?author=${encodeURIComponent(author.slug ?? author.name)}`}
          className="text-xs text-primary hover:underline mt-2"
        >
          Xem các cuốn sách của tác giả này →
        </Link>
      </div>
    </div>
  );
}

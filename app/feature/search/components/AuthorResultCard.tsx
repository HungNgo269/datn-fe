import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import type { AuthorInfo } from "@/app/feature/author/types/authors.types";
import { HighlightedText } from "./HighlightedText";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface AuthorResultCardProps {
  author: AuthorInfo;
  query: string;
}

export function AuthorResultCard({ author, query }: AuthorResultCardProps) {
  const safeBio = useMemo(
    () => (author.bio ? sanitizeRichHtml(author.bio) : null),
    [author.bio]
  );

  return (
    <Link
      href={`/authors/${author.slug}`}
      prefetch={false}
      className="group block"
    >
      <div className="flex gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5">
        {/* Avatar */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted border border-border/40">
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {author.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
          {/* Name */}
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            <HighlightedText text={author.name} query={query} />
          </h3>

          {/* Bio */}
          {safeBio ? (
            <div
              className="text-sm text-muted-foreground line-clamp-2 leading-relaxed prose prose-sm prose-p:m-0"
              dangerouslySetInnerHTML={{ __html: safeBio }}
            />
          ) : (
            <p className="text-sm text-muted-foreground/70 italic">
              Chưa có mô tả về tác giả này.
            </p>
          )}

          {/* Link */}
          <span className="text-xs font-medium text-primary group-hover:underline mt-auto">
            Xem sách của tác giả →
          </span>
        </div>
      </div>
    </Link>
  );
}

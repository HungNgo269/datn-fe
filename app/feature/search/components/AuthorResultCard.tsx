import Image from "next/image";
import Link from "next/link";
import type { AuthorInfo } from "@/app/feature/author/types/authors.types";
import { HighlightedText } from "./HighlightedText";

interface AuthorResultCardProps {
  author: AuthorInfo;
  query: string;
}

export function AuthorResultCard({ author, query }: AuthorResultCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border  p-4 transition hover:border-primary/50">
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
        <Link
          prefetch={false}
          href={`/books?search=${encodeURIComponent(author.name)}`}
          className="text-xs text-primary hover:underline mt-1"
        ></Link>
      </div>
    </div>
  );
}

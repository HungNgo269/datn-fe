import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { AuthorInfo } from "../types/authors.types";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface AuthorCardProps {
  author: AuthorInfo;
}

export default function AuthorCard({ author }: AuthorCardProps) {
  const avatar = author.avatar;
  const safeBio = useMemo(() => sanitizeRichHtml(author.bio), [author.bio]);

  return (
    <div className="group flex w-full flex-col gap-4">
      <Link
        href={`/authors/${author.slug}`}
        prefetch={false}
        className="block"
        aria-label={`View profile for ${author.name}`}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted/30">
          <Image
            src={avatar!}
            alt={author.name}
            fill
            priority={false}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 230px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {/* Subtle overlay for depth on hover, ultra premium feel */}
          <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5">
        <Link
          href={`/authors/${author.slug}`}
          prefetch={false}
          className="w-fit"
        >
          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {author.name}
          </h3>
        </Link>
        
        <div className="flex-1">
          {safeBio ? (
            <div
              className="line-clamp-2 text-sm text-muted-foreground/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: safeBio }}
            />
          ) : (
            <p className="line-clamp-2 text-sm text-muted-foreground/50 leading-relaxed italic">
              Đang cập nhật giới thiệu...
            </p>
          )}
        </div>

        <Link
          href={`/books?author=${author.slug}&page=1`}
          prefetch={false}
          className="mt-2 inline-flex items-center text-xs font-medium uppercase tracking-wide text-primary/90 transition-colors hover:text-primary"
        >
          Xem tác phẩm
          <svg
            className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

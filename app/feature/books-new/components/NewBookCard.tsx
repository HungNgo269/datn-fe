"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { Book } from "../../books/types/books.type";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface NewBookCardProps {
  book: Book;
}

export default function NewBookCard({ book }: NewBookCardProps) {
  // Memoize sanitized HTML to ensure consistency between server and client
  const sanitizedDescription = useMemo(
    () => book.description ? sanitizeRichHtml(book.description) : "",
    [book.description]
  );

  // Use client-side only rendering for categories to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const displayCategories = useMemo(
    () => book.categories?.slice(0, 2) || [],
    [book.categories]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col  rounded-xl overflow-hidden  h-full">
      {/* Image */}
      <Link
        prefetch={false}
        href={`/books/${book.slug}`}
        className="relative aspect-[4/3] overflow-hidden group"
      >

        <div className="absolute inset-0">
          <ImageCard
            bookImage={book.coverImage}
            bookName={book.title}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <Link prefetch={false} href={`/books/${book.slug}`}>
          <h3 className="font-bold text-sm line-clamp-1 hover:text-primary transition-colors">
            {book.title}
          </h3>
        </Link>

        <div className="text-xs text-muted-foreground line-clamp-1">
          {book.authors?.map((authorEntry, index) => (
            <span key={authorEntry.author.id}>
              <Link
                href={`/authors/${authorEntry.author.slug}`}
                className="hover:underline"
              >
                {authorEntry.author.name}
              </Link>
              {index < book.authors.length - 1 && ", "}
            </span>
          ))}
        </div>

{sanitizedDescription && (
  <div 
    className="text-xs text-muted-foreground line-clamp-4 flex-1"
    dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
  />
)}

        {/* Category tags */}
        {isMounted && displayCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {displayCategories.map((catEntry) => (
              <Link
                key={catEntry.category.id}
                href={catEntry.category.slug ? `/books?category=${catEntry.category.slug}&page=1` : "#"}
                className="rounded-md bg-muted/80 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                prefetch={false}
              >
                #{catEntry.category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

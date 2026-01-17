"use client";

import Link from "next/link";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { Book } from "../../books/types/books.type";

interface NewBookCardProps {
  book: Book;
}

export default function NewBookCard({ book }: NewBookCardProps) {
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

        {book.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
            {book.description}
          </p>
        )}

        {/* Category tags */}
        {book.categories && book.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {book.categories.slice(0, 2).map((catEntry) => (
              <Link
                key={catEntry.category.id}
                href={`/books?category=${catEntry.category.slug}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
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

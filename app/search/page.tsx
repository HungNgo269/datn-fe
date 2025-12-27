import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { ReactNode } from "react";

import Header from "../share/components/ui/header/header";
import FooterComponent from "../share/components/ui/footer/footer";
import { getBooksAction } from "../feature/books/action/books.action";
import { Book } from "../feature/books/types/books.type";
import { searchAuthorsAction } from "../feature/author/actions/authors.actions";
import { AuthorInfo } from "../feature/author/types/authors.types";
import { getURL } from "@/lib/helper";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";
import { cn } from "@/lib/utils";

const SEARCH_PAGE_TITLE = "Search Books & Authors";
const SEARCH_PAGE_DESCRIPTION =
  "Look up books or authors in the NextBook library and jump straight to the stories that match your interests.";
const SEARCH_PAGE_URL = getURL("search");

export const metadata: Metadata = {
  title: { absolute: SEARCH_PAGE_TITLE },
  description: SEARCH_PAGE_DESCRIPTION,
  alternates: { canonical: SEARCH_PAGE_URL },
  openGraph: {
    url: SEARCH_PAGE_URL,
    title: SEARCH_PAGE_TITLE,
    description: SEARCH_PAGE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SEARCH_PAGE_TITLE,
    description: SEARCH_PAGE_DESCRIPTION,
  },
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

const BOOK_RESULT_LIMIT = 12;
const AUTHOR_RESULT_LIMIT = 6;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() ?? "";

  const [bookResults, authorResults] = await Promise.all([
    query
      ? getBooksAction({ search: query, limit: BOOK_RESULT_LIMIT, page: 1 })
      : Promise.resolve(null),
    query
      ? searchAuthorsAction({
          query,
          limit: AUTHOR_RESULT_LIMIT,
          page: 1,
        })
      : Promise.resolve(null),
  ]);

  const books = bookResults?.data ?? [];
  const authors = authorResults?.data ?? [];

  return (
    <div className="overflow-x-hidden">
      <header className="ml-auto mr-auto w-full">
        <Suspense>
          <Header />
        </Suspense>
      </header>
      <main className="mx-auto mt-24 w-full max-w-[1200px] px-4 pb-16 lg:px-0">
        <section className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Search results
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {query
              ? `Showing matches for "${query}".`
              : "Start typing in the header search box to discover books and authors."}
          </p>
        </section>

        {query ? (
          <div className="mt-12 space-y-12">
            <ResultSection
              title="Books"
              count={books.length}
              emptyMessage={`No books found for "${query}".`}
            >
              {books.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {books.map((book) => (
                    <BookResultCard key={book.id} book={book} query={query} />
                  ))}
                </div>
              ) : null}
            </ResultSection>

            <ResultSection
              title="Authors"
              count={authors.length}
              emptyMessage={`No authors found for "${query}".`}
            >
              {authors.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {authors.map((author) => (
                    <AuthorResultCard
                      key={author.id}
                      author={author}
                      query={query}
                    />
                  ))}
                </div>
              ) : null}
            </ResultSection>
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border bg-card/40 p-6 text-center">
            <p className="text-lg font-medium">Waiting for your search</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Type a book title or an author name in the header search box.
              You will be redirected here automatically once you stop typing for
              half a second.
            </p>
          </div>
        )}
      </main>
      <div className="w-full">
        <Suspense>
          <FooterComponent />
        </Suspense>
      </div>
    </div>
  );
}

function ResultSection({
  title,
  count,
  children,
  emptyMessage,
}: {
  title: string;
  count: number;
  children: ReactNode;
  emptyMessage: string;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? "match" : "matches"}
          </p>
        </div>
      </div>
      {count > 0 ? (
        children
      ) : (
        <EmptyState message={emptyMessage} className="py-8" />
      )}
    </section>
  );
}

function BookResultCard({ book, query }: { book: Book; query: string }) {
  const authorNames =
    book.authors?.map((item) => item.author.name).join(", ") || "Unknown";
  const sanitizedDescription = sanitizeRichHtml(book.description);

  return (
    <Link
      href={`/books/${book.slug}`}
      className="flex gap-4 rounded-2xl border border-border/70 bg-card/40 p-4 transition hover:border-primary/70 hover:bg-card/70"
      prefetch={true}
    >
      <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={book.coverImage || "/images/sachFallback.jpg"}
          alt={book.title}
          fill
          sizes="80px"
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-base font-semibold leading-tight">
          <HighlightedText text={book.title} query={query} />
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          <HighlightedText
            text={authorNames}
            query={query}
            fallback="Unknown author"
          />
        </p>
        {sanitizedDescription ? (
          <div
            className="prose prose-sm text-muted-foreground line-clamp-2"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-2">
            Description updating soon.
          </p>
        )}
      </div>
    </Link>
  );
}

function AuthorResultCard({
  author,
  query,
}: {
  author: AuthorInfo;
  query: string;
}) {
  const sanitizedBio = sanitizeRichHtml(author.bio);

  return (
    <div className="flex gap-4 rounded-2xl border border-border/70 bg-card/40 p-4">
      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-semibold text-muted-foreground">
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            sizes="64px"
            className="object-cover"
            unoptimized
          />
        ) : (
          (author.name?.[0] ?? "?")
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-base font-semibold leading-tight">
          <HighlightedText text={author.name} query={query} />
        </p>
        {sanitizedBio ? (
          <div
            className="prose prose-sm text-muted-foreground line-clamp-2"
            dangerouslySetInnerHTML={{ __html: sanitizedBio }}
          />
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-2">
            This author will have a bio soon.
          </p>
        )}
        <Link
          prefetch={true}
          href={`/books?search=${encodeURIComponent(author.name)}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View books
        </Link>
      </div>
    </div>
  );
}

function HighlightedText({
  text,
  query,
  fallback,
  className,
}: {
  text?: string | null;
  query: string;
  fallback?: string;
  className?: string;
}) {
  if (!text) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {fallback ?? "Updating soon"}
      </span>
    );
  }

  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return <span className={className}>{text}</span>;
  }

  const escapedQuery = escapeRegExp(normalizedQuery);
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-primary/15 px-1 text-primary"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </span>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function EmptyState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-center text-sm text-muted-foreground",
        className
      )}
    >
      {message}
    </div>
  );
}

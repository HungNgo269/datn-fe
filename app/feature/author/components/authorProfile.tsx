import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { AuthorInfo } from "../types/authors.types";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface AuthorProfileProps {
  author: AuthorInfo;
  bookCount?: number;
}

const formatDate = (value?: string | Date) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export default function AuthorProfile({
  author,
  bookCount,
}: AuthorProfileProps) {
  const avatar = author.avatar;
  const joined = useMemo(() => formatDate(author.createdAt), [author.createdAt]);
  const safeBio = useMemo(() => sanitizeRichHtml(author.bio), [author.bio]);

  return (
    <section className="relative flex flex-col gap-8 md:flex-row md:gap-10">
      {/* Avatar Section */}
      <div className="flex shrink-0 flex-col items-center md:items-start">
        <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm md:h-52 md:w-52 lg:h-64 lg:w-64">
          <Image
            src={avatar!}
            alt={author.name}
            fill
            sizes="(max-width: 768px) 160px, 256px"
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-1 flex-col py-2">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {author.name}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground md:justify-start">
            {joined && (
              <span className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 opacity-70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Tham gia {joined}
              </span>
            )}
            {typeof bookCount === "number" && (
              <span className="flex items-center gap-1.5">
                 <svg
                  className="h-4 w-4 opacity-70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <strong className="font-medium text-foreground">{bookCount}</strong> tác phẩm
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 md:mt-8">
          {safeBio ? (
             <div
             className="prose prose-neutral max-w-none text-muted-foreground/90 leading-relaxed md:prose-lg prose-p:my-3 prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
             dangerouslySetInnerHTML={{
               __html: safeBio,
             }}
           />
          ) : (
            <p className="italic text-muted-foreground/60">
              Tác giả chưa cập nhật thông tin giới thiệu.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

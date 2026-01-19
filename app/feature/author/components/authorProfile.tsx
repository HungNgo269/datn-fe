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
    month: "short",
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
    <section className="flex flex-col gap-6 ">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex items-center justify-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-border/50 bg-muted md:h-40 md:w-40">
            <Image
              src={avatar!}
              alt={author.name}
              fill
              sizes="160px"
              priority={false}
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold uppercase tracking-tight sm:text-3xl">
              {author.name}
            </h1>
            {safeBio && (
              <div
                className="prose prose-sm mt-3 text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: safeBio,
                }}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {joined && (
              <span>
                Gia nhập NextBook{" "}
                <strong className="text-foreground">{joined}</strong>
              </span>
            )}
            {typeof bookCount === "number" && (
              <span>
                Có{" "}
                <strong className="text-foreground">
                  {bookCount} {bookCount === 1 ? "tác phẩm" : "tác phẩm"}
                </strong>{" "}
                trên thư viện
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/authors"
              prefetch={false}
              className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
            >
              Quay lại danh sách tác giả
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

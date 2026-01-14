import Image from "next/image";
import Link from "next/link";
import { AuthorInfo } from "../types/authors.types";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface AuthorCardProps {
  author: AuthorInfo;
}

export default function AuthorCard({ author }: AuthorCardProps) {
  const avatar = author.avatar;
  const safeBio = sanitizeRichHtml(author.bio);

  return (
    <div className="flex w-full max-w-[230px] flex-col gap-3">
      <Link
        href={`/authors/${author.slug}`}
        prefetch={true}
        className="group block"
        aria-label={`View profile for ${author.name}`}
      >
        <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-muted shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={avatar!}
              alt={author.name}
              fill
              priority={false}
              unoptimized
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 230px"
              className="object-cover transition-transform duration-500 group-hover:scale-[103%]"
            />
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <Link
          href={`/authors/${author.slug}`}
          prefetch={true}
          className="w-fit"
        >
          <h3 className="text-base font-semibold tracking-tight text-foreground transition-colors hover:text-primary -foreground">
            {author.name}
          </h3>
        </Link>
        <div className="flex-1">
          {safeBio ? (
            <div
              className="prose prose-sm text-muted-foreground line-clamp-3 leading-relaxed prose-p:mb-2"
              dangerouslySetInnerHTML={{ __html: safeBio }}
            />
          ) : (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              Chưa có mô tả về tác giả này.
            </p>
          )}
        </div>

        <Link
          href={`/books?author=${author.slug}&page=1`}
          prefetch={true}
          className="mt-auto text-sm font-medium text-primary hover:underline w-fit"
        >
          Xem sách của tác giả
        </Link>
      </div>
    </div>
  );
}

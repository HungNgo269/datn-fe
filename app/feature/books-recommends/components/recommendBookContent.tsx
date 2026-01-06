import Link from "next/link";
import { BookCardProps } from "../../books/types/books.type";
import ImageCard from "@/app/share/components/ui/image/ImageCard";

function buildAuthorHref(name: string, slug?: string | null): string {
  if (slug) {
    return `/authors/${slug}`;
  }
  return `/authors`;
}

interface RecommendBookContentProps {
  books: BookCardProps[];
}

export default function RecommendBookContent({
  books,
}: RecommendBookContentProps) {
  return (
    <div className="space-y-3">
      {books.map((book: BookCardProps) => (
        <div
          key={book.id}
          className="flex flex-row items-center gap-2 h-[80px]"
        >
          <Link
            prefetch={true}
            href={`/books/${book.slug}`}
            className="relative min-w-[60px] max-w-[60px] h-full overflow-hidden rounded-[4px] group "
          >
            <ImageCard bookImage={book?.coverImage} bookName={book.title} />
          </Link>
          <div className="flex flex-col justify-center h-full xl:max-w-[250px] lg:max-w-[150px] md:max-w-[150px] max-w-full">
            <Link
              prefetch={true}
              href={`/books/${book.slug}`}
              className="text-sm font-semibold cursor-pointer hover:underline hover:text-primary line-clamp-2"
            >
              {book.title}
            </Link>
            <div className="flex flex-row items-center overflow-hidden max-w-full">
              <div className="text-xs text-muted-foreground truncate">
                {book.authors.map((authorEntry, index) => {
                  const { author } = authorEntry;
                  const authorHref = buildAuthorHref(author.name, author.slug);

                  return (
                    <span key={author.id}>
                      <Link
                        prefetch={true}
                        href={authorHref}
                        className="hover:underline"
                      >
                        {author.name}
                      </Link>
                      {index < book.authors.length - 1 && ", "}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import Link from "next/link";
import { BookCardProps } from "../../books/types/books.type";
import ImageCard from "@/app/share/components/ui/image/ImageCard";

interface PopularBookContentProps {
  books: BookCardProps[];
}

export default function PopularBookContent({ books }: PopularBookContentProps) {
  return (
    <div className="space-y-3">
      {books.map((book: BookCardProps, index) => (
        <div
          key={book.id}
          className="flex flex-row items-center gap-2 h-[80px]"
        >
          <Link
            prefetch={true}
            href={`/books/${book.slug}`}
            className="relative min-w-[60px] h-full overflow-hidden rounded-[4px] group "
          >
            <ImageCard bookImage={book?.coverImage} bookName={book.title} />
          </Link>
          <div className="min-w-6 min-h-6 flex items-center justify-center text-2xl font-bold text-card-foreground">
            {index + 1}
          </div>
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
                {book.authors.map((author, index) => (
                  <span key={author.author.id}>
                    <Link
                      prefetch={true}
                      href={`${book.viewCount}`}
                      className="hover:underline"
                    >
                      {author.author.name}
                    </Link>
                    {index < book.authors.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

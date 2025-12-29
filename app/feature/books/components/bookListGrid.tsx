import BookCard from "../../books-carousel/components/bookCard";
import { BookCardProps } from "../types/books.type"; // Import type đúng của bạn

interface BookListProps {
  books: BookCardProps[];
}

export function BookList({ books }: BookListProps) {
  if (!books || books.length === 0) {
    return (
      <div className="w-full py-10 text-center text-muted-foreground">
        No books found matching your criteria.
      </div>
    );
  }

  return (
    <div
      className="
      w-full gap-2
      grid grid-cols-2
      sm:grid-cols-3
      md:grid-cols-4
      lg:grid-cols-5
      justify-items-start
    "
    >
      {books.map((book) => (
        <BookCard variant="sm" book={book} key={book.id} />
      ))}
    </div>
  );
}

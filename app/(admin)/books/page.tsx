import { getBooks } from "@/app/feature/books/api/books.api";
import { BookList } from "@/app/feature/books/components/BookList";
import Link from "next/link";

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Books</h1>
        <Link
          href="/books/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Upload Book
        </Link>
      </div>
      <BookList books={books} />
    </div>
  );
}

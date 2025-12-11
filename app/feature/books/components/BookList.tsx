"use client";

import { Book } from "../types/books.type";

interface BookListProps {
  books: Book[];
}

export function BookList({ books }: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No books yet. Upload your first book!
      </div>
    );
  }
  console.log("b", books);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {books &&
        books.length > 0 &&
        books.map((book) => (
          <div
            key={book.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
            <p className="text-sm text-gray-600">
              Uploaded: {new Date(book.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
    </div>
  );
}

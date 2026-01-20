import {
  AuthorsList,
  Book,
  BookCardProps,
} from "@/app/feature/books/types/books.type";

export const mapBooksToCardProps = (books: Book[]): BookCardProps[] => {
  return books.map((book) => ({
    id: book.id,
    title: book.title,
    slug: book.slug,
    coverImage: book.coverImage,
    viewCount: book.viewCount,
    price: book.price ?? 0,
    authors: book.authors ?? ([] as AuthorsList[]),
  }));
};

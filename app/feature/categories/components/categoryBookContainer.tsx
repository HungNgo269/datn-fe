"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import CategorySelector from "./categorySelector";
import BookCarousel from "../../books-carousel/components/bookCarousel";
import BookCard from "../../books-carousel/components/bookCard";
import { Category } from "../types/listCategories";
import { Book, BookSortBy, SortOrder } from "../../books/types/books.type";
import { getBooksByQuery } from "../../books/api/books.api";

interface BookCategoryClientProps {
  categories: Category[];
  booksIni: Book[];
}

export default function BookCategoryClient({
  categories,
  booksIni,
}: BookCategoryClientProps) {
  const defaultCategoryId = categories?.[0]?.id;

  const [selectedCategory, setSelectedCategory] = useState(defaultCategoryId);
  const [books, setBooks] = useState(booksIni);

  const [isPending, startTransition] = useTransition();

  const categoriesById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  const currentCategory = selectedCategory
    ? categoriesById.get(selectedCategory)
    : undefined;
  const dynamicTitle = currentCategory?.description || "";
  const selectedCategorySlug =
    currentCategory?.slug || categories?.[0]?.slug || "";

  const handleCategoryChange = useCallback(
    (categoryId: number) => {
      if (categoryId === selectedCategory) return;

      setSelectedCategory(categoryId);

      startTransition(async () => {
        setBooks([]);

        const targetCategory = categoriesById.get(categoryId);
        const newBooks = await getBooksByQuery({
          page: 1,
          limit: 10,
          category: targetCategory?.slug || currentCategory?.slug,
          sortBy: BookSortBy.VIEW_COUNT,
          sortOrder: SortOrder.DESC,
        });
        setBooks(newBooks.data);
      });
    },
    [categoriesById, currentCategory?.slug, selectedCategory]
  );

  return (
    dynamicTitle &&
    books &&
    selectedCategory && (
      <div className="mt-6 w-full space-y-4">
        <span className="mb-1 block text-lg font-semibold sm:text-xl md:text-2xl">
          {dynamicTitle}
        </span>

        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-row items-start justify-between gap-4">
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <CategorySelector
                categories={categories}
                selectedCategory={selectedCategory || 0}
                onCategoryChange={handleCategoryChange}
              />
            </div>
            <ViewMoreButton
              context="book"
              url={`/books?category=${encodeURIComponent(
                selectedCategorySlug
              )}&page=1`}
            />
          </div>
          <div className="block w-full md:hidden">
            <div className="grid grid-cols-3 gap-3">
              {books.slice(0, 6).map((book) => (
                <BookCard key={book.id} book={book} variant="sm" />
              ))}
            </div>
          </div>
          <div className="hidden w-full md:block mt-4">
            <BookCarousel
              books={books}
              variant="lg"
              isLoading={isPending || books.length === 0}
            />
          </div>
        </div>
      </div>
    )
  );
}

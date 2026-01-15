"use client";

import { useState, useTransition } from "react";
import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import CategorySelector from "./categorySelector";
import BookCarousel from "../../books-carousel/components/bookCarousel";
import Swipper from "@/app/share/components/ui/swipper/swipper";
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

  const currentCategory = categories.find((cat) => cat.id === selectedCategory);
  const dynamicTitle = currentCategory?.description || "";
  const selectedCategorySlug =
    currentCategory?.slug || categories?.[0]?.slug || "";

  const handleCategoryChange = (categoryId: number) => {
    if (categoryId === selectedCategory) return;

    // Set category và clear books cùng lúc
    setSelectedCategory(categoryId);

    startTransition(async () => {
      // Show skeleton ngay
      setBooks([]); // ⭐ Hoặc setBooks(Array(10).fill(null))

      const targetCategory = categories.find((cat) => cat.id === categoryId);
      const newBooks = await getBooksByQuery({
        page: 1,
        limit: 10,
        category: targetCategory?.slug || currentCategory?.slug,
        sortBy: BookSortBy.VIEW_COUNT,
        sortOrder: SortOrder.DESC,
      });
      setBooks(newBooks.data);
    });
  };
  return (
    dynamicTitle &&
    books &&
    selectedCategory && (
      <div className="mt-6 w-full space-y-4">
        <span className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 block">
          {dynamicTitle}
        </span>

        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row justify-between items-center w-full gap-2">
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory || 0}
              onCategoryChange={handleCategoryChange}
            />
            <ViewMoreButton
              context="book"
              url={`/books?category=${encodeURIComponent(
                selectedCategorySlug
              )}&page=1`}
            />
          </div>
          <div className="block md:hidden w-full">
            <Swipper books={books} showHeader={false} showViewMore={false} />
          </div>
          <div className="hidden md:block w-full">
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

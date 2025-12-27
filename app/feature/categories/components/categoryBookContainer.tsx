"use client";

import { useState, useTransition } from "react";
import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import CategorySelector from "./categorySelector";
import BookCarousel from "../../books-carousel/components/bookCarousel";
import { Category } from "../types/listCategories";
import {
  Book,
  BookCardProps,
  BookSortBy,
  GetBooksParams,
  SortOrder,
} from "../../books/types/books.type";
import { getBooksAction } from "../../books/action/books.action";

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
  const selectedCategorySlug = currentCategory?.slug || "van-hoc-co-dien";

  const handleCategoryChange = (categoryId: number) => {
    if (categoryId === selectedCategory) return;

    setSelectedCategory(categoryId);
    const params: GetBooksParams = {
      sortBy: BookSortBy.VIEW_COUNT,
      category: currentCategory?.slug,
      limit: 10,
      page: 1,
      sortOrder: SortOrder.DESC,
    };

    startTransition(async () => {
      const newBooks = await getBooksAction(params);
      setBooks(newBooks.data);
    });
  };
  console.log("bockk lí", books);
  return (
    !isPending &&
    dynamicTitle &&
    books &&
    selectedCategory && (
      <div className="mt-6 w-full">
        <span className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 block">
          {dynamicTitle}
        </span>

        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row justify-between items-center w-full gap-2">
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory || 0}
              onCategoryChange={handleCategoryChange}
            />
            <ViewMoreButton url={`/books?tag=${selectedCategorySlug}&page=1`} />
          </div>
          <BookCarousel books={books} variant="lg" isLoading={isPending} />
        </div>
      </div>
    )
  );
}

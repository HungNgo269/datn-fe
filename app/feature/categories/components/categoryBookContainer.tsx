"use client";
import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import { useState, useMemo, useCallback, useEffect } from "react";
import CategorySelector from "./categorySelector";
import { Category } from "../types/listCategories";
import BookCarousel from "../../books-carousel/components/bookCarousel";
import { Book } from "../../books/types/books.type";
import { mapBooksToCardProps } from "@/lib/mapBooktoBookCard";
import { getBookByCategory } from "../../books/api/books.api";

interface BookCategoryContainerProps {
  categories: Category[];
  initialBooks: Book[];
}

export default function BookCategoryContainer({
  categories,
  initialBooks,
}: BookCategoryContainerProps) {
  const defaultCategory = categories?.[0]?.id;

  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const mappedBooks = useMemo(() => {
    return mapBooksToCardProps(books);
  }, [books]);
  const [loading, setLoading] = useState(false);

  const currentCategory = useMemo(
    () => categories.find((cat) => cat.id === selectedCategory),
    [categories, selectedCategory]
  );

  const dynamicTitle = currentCategory?.description || "";
  const selectedCategorySlug = currentCategory?.slug || "van-hoc-co-dien";

  const handleCategoryChange = useCallback((categoryId: number) => {
    setSelectedCategory(categoryId);
  }, []);

  useEffect(() => {
    if (selectedCategory === defaultCategory && books === initialBooks) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getBookByCategory(selectedCategory);
        setBooks(res.data);
        console.log("Fetching for:", selectedCategory);
      } catch (error) {
        console.error(error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory) fetchData();
  }, [selectedCategory, defaultCategory, initialBooks]);

  return (
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
          <ViewMoreButton url={`/book?tag=${selectedCategorySlug}&page=1`} />
        </div>

        <BookCarousel books={mappedBooks} variant="lg" isLoading={loading} />
      </div>
    </div>
  );
}

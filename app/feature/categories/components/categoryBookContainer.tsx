"use client";
import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import { useState, useMemo, useCallback, useEffect } from "react";
import CategorySelector from "./categorySelector";
import { Category } from "../types/listCategories";

interface BookCategoryContainerProps {
  categories: Category[];
}

export default function BookCategoryContainer({
  categories,
}: BookCategoryContainerProps) {
  const defaultCategory = categories?.[0]?.id;

  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState("Văn học Kinh điển");

  //   const [books, setBooks] = useState<BookCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //   const fetchBooks = useCallback(async (categoryId: number) => {
  //     if (!categoryId) return;
  //     setLoading(true);
  //     setError("");
  //     setBooks([]);
  //     try {
  //       const response = await fetchMostViewedBookByCategoryActions(categoryId);
  //       if (!response) throw new Error("Failed to fetch category");
  //       setBooks(response);
  //     } catch (err: unknown) {
  //       let error = err as Error;
  //       setError(error.message);
  //       setBooks([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, []);

  //   useEffect(() => {
  //     if (selectedCategory) {
  //       fetchBooks(selectedCategory);
  //     }
  //   }, [selectedCategory, fetchBooks]);
  const handleCategoryChange = useCallback((categoryId: number) => {
    setSelectedCategory(categoryId);
  }, []);

  const dynamicTitle = useMemo(() => {
    const selectedCat = categories.find(
      (cat: Category) => cat.id === selectedCategory
    );
    return selectedCat?.description;
  }, [categories, selectedCategory]);

  return (
    <div className="mt-6 w-full">
      <span className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">
        {dynamicTitle}
      </span>

      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row justify-between w-full gap-2">
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          <ViewMoreButton url={`/book?tag=${selectedCategorySlug}&page=1`} />
        </div>

        {/* <BookCarousel books={books} variant="lg" isLoading={loading} /> */}
      </div>
    </div>
  );
}

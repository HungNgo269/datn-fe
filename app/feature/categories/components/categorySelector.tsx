"use client";
import { Category } from "../types/listCategories";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: number;
  onCategoryChange: (categoryId: number) => void;
}

export default function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  return (
    <div className="flex flex-row flex-wrap items-center gap-2 md:gap-0 md:overflow-hidden font-medium">
      {categories.map((category, index) => {
        const isActive = selectedCategory === category.id;
        return (
          <div key={category.id} className="flex items-center">
            <button
              onClick={() => onCategoryChange(category.id)}
              className={`text-nowrap transition-colors hover:text-primary hover:cursor-pointer
                ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-foreground lg:text-base"
                }`}
            >
              {category.name}
            </button>

            {/* Dấu chấm ngăn cách */}
            {index < categories.length - 1 && (
              <span className="mx-2 text-gray-400 text-xs hidden md:inline-block">
                •
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

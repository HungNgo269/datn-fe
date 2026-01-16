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
    <div className="flex flex-row flex-wrap items-center gap-2 font-medium md:gap-0 md:overflow-hidden">
      {categories.map((category, index) => {
        const isActive = selectedCategory === category.id;
        return (
          <div key={category.id} className="flex items-center">
            <button
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`text-nowrap cursor-pointer transition-colors hover:text-primary
                ${
                  isActive
                    ? "font-medium text-primary"
                    : "text-foreground lg:text-base"
                }`}
            >
              {category.name}
            </button>

            {index < categories.length - 1 && (
              <span className="mx-2 hidden text-xs text-muted-foreground md:inline-block">
                •
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

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
    <div 
      className="
        flex flex-row items-center gap-1 font-medium 
        overflow-x-auto whitespace-nowrap pb-2
        scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] 
        [&::-webkit-scrollbar]:hidden
        md:gap-0 md:overflow-hidden md:pb-0
      "
    >
      {categories.map((category, index) => {
        const isActive = selectedCategory === category.id;
        return (
          <div key={category.id} className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`text-sm md:text-base cursor-pointer transition-colors hover:text-primary
                ${
                  isActive
                    ? "font-bold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {category.name}
            </button>

            {index < categories.length - 1 && (
              <span className="mx-0.5 text-xs text-muted-foreground/30">
                •
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
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
    <div className="flex flex-row justify-start items-center gap-0.5 md:overflow-hidden ">
      {categories.map((category: Category, index) => (
        <div key={category.id} className="flex flex-row justify-center gap-0.5">
          <button
            onClick={() => onCategoryChange(category.id)}
            className={`
              hover:cursor-pointer text-nowrap ${
                selectedCategory === category.id
                  ? " text-primary"
                  : " lg:text-base text-foreground"
              }`}
          >
            {category.name}
          </button>

          <div className="flex justify-center items-center">
            {index < categories.length - 1 && (
              <span className="text-gray-500 text-xs text-center">•</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

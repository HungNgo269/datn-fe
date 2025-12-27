"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "../types/listCategories";

interface CategoryFilterProps {
  currentCategory?: string;
  categories: Category[];
}

export default function CategoryFilter({
  currentCategory,
  categories,
}: CategoryFilterProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Nếu chọn "all" hoặc giá trị rỗng thì xóa param
    if (newCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", newCategory);
    }

    // Reset về trang 1 khi đổi filter
    params.set("page", "1");

    startTransition(() => {
      router.push(`/books?${params.toString()}`); // Chú ý path /books hay /book tùy route của bạn
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Select
        defaultValue={currentCategory || ""}
        onValueChange={handleCategoryChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Genres</SelectLabel>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cate) => (
              <SelectItem key={cate.id} value={cate.name}>
                {cate.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

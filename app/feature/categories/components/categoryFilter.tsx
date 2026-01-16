"use client";

import { Suspense, useCallback, useTransition } from "react";
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

function CategoryFilterContent({
  currentCategory,
  categories,
}: CategoryFilterProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = useCallback(
    (newCategory: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newCategory === "all") {
        params.delete("category");
      } else {
        params.set("category", newCategory);
      }

      params.set("page", "1");

      startTransition(() => {
        router.push(`/books?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="flex items-center gap-3">
      <Select
        defaultValue={currentCategory || "all"}
        onValueChange={handleCategoryChange}
        disabled={isPending}
      >
        <SelectTrigger className="min-w-fit w-[200px]">
          <SelectValue placeholder="Tất cả thể loại" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Thể loại</SelectLabel>
            <SelectItem value="all">Tất cả sách</SelectItem>
            {categories.map((cate) => (
              <SelectItem key={cate.id} value={cate.slug}>
                {cate.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default function CategoryFilter(props: CategoryFilterProps) {
  return (
    <Suspense fallback={<div className="h-10 w-[200px]" />}>
      <CategoryFilterContent {...props} />
    </Suspense>
  );
}

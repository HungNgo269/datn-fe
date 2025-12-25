"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookSortBy } from "../../books/types/books.type";

interface Props {
  currentSort: string;
}

const SORT_OPTIONS = [
  { id: 1, name: "Latest", slug: BookSortBy.CREATED_AT },
  { id: 2, name: "Updated", slug: BookSortBy.UPDATED_AT },
  { id: 3, name: "Popular", slug: BookSortBy.VIEW_COUNT },
  { id: 4, name: "A-Z", slug: BookSortBy.TITLE },
];

export default function SortSelection({ currentSort }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (newSort: string) => {
    // Không cần set local state vì URL thay đổi sẽ re-render component cha và truyền prop mới vào
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSort);
    // Có thể muốn reset về page 1 khi đổi sort
    // params.set("page", "1");

    startTransition(() => {
      router.push(`/books?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {SORT_OPTIONS.map((option) => {
        const isActive = currentSort === option.slug;
        return (
          <Button
            key={option.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort(option.slug)}
            disabled={isPending}
            className={`text-sm transition-all ${
              isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
            }`}
          >
            {option.name}
          </Button>
        );
      })}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookSortBy } from "../../books/types/books.type";

interface Props {
  currentSort: string;
}

const SORT_OPTIONS = [
  { id: 1, name: "Mới nhất", slug: BookSortBy.CREATED_AT },
  { id: 2, name: "Phổ biến", slug: BookSortBy.VIEW_COUNT },
  { id: 3, name: "Vừa cập nhật", slug: BookSortBy.UPDATED_AT },
];

export default function SortSelection({ currentSort }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSort);
    params.set("page", "1");

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

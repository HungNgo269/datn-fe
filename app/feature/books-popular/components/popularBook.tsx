"use client";

import { useQuery } from "@tanstack/react-query";
import { getPopularBooks } from "../api/popularBook.api";
import PopularBookContent from "./popularBookContent";
import { TrendingBookSkeleton } from "@/app/share/components/ui/skeleton/skeleton";
import { Separator } from "@/components/ui/separator";

export default function PopularBook() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["popularBooks"],
    queryFn: () => getPopularBooks(5),
    placeholderData: (previousData) => previousData,
  });

  if (isError) {
    return (
      <div className="p-10 text-destructive text-center">
        Không thể tải dữ liệu
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-3 md:flex-col mt-10">
        <span className="font-bold text-lg text-start whitespace-nowrap">
          Những cuốn sách được xem nhiều nhất
        </span>
      </div>
      <Separator></Separator>
      <div className="space-y-3 mt-2">
        {isLoading ? (
          <TrendingBookSkeleton />
        ) : (
          <PopularBookContent books={data || []} />
        )}
      </div>
    </div>
  );
}

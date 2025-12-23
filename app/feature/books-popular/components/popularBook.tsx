"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PopularBookSkeleton } from "@/app/share/components/ui/skeleton/skeleton";
import PopularBookFilter from "./popularBookFilter";
import { TimeFrame } from "@/lib/timeCount";
import PopularBookContent from "./popularBookContent";
import { getTrendingBooks } from "../api/books-popular.api";

export default function PopularBook() {
  const [timeFilter, setTimeFilter] = useState<TimeFrame>("month");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["popularBooks", timeFilter],
    queryFn: () => getTrendingBooks(timeFilter, 5),
    placeholderData: (previousData) => previousData,
  });

  const handleFilterChange = (newTimeFrame: TimeFrame) => {
    setTimeFilter(newTimeFrame);
  };
  if (isError) {
    return (
      <div className="p-10 text-destructive text-center">
        Không thể tải dữ liệu
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row gap-3 md:flex-col">
        <span className="font-bold text-lg text-start whitespace-nowrap">
          Most views book in
        </span>
        <PopularBookFilter
          value={timeFilter}
          onFilterChange={handleFilterChange}
        />
      </div>
      <div className="space-y-3 mt-2">
        {isLoading ? (
          <PopularBookSkeleton />
        ) : (
          <PopularBookContent books={data || []} />
        )}
      </div>
    </>
  );
}

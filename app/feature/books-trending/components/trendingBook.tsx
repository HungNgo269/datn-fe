"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingBookSkeleton } from "@/app/share/components/ui/skeleton/skeleton";
import { TimeFrame } from "@/lib/timeCount";
import { getTrendingBooks } from "../api/books-trending.api";
import TrendingBookFilter from "./trendingBookFilter";
import TrendingBookContent from "./tredingBookContent";
import { Separator } from "@/components/ui/separator";

export default function TrendingBook() {
  const [timeFilter, setTimeFilter] = useState<TimeFrame>("month");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trendingBooks", timeFilter],
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
    <div className="flex flex-col gap-2 mt-5">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between">
        <span className="font-bold text-lg text-start whitespace-nowrap">
          Xu hướng
        </span>
        <TrendingBookFilter
          value={timeFilter}
          onFilterChange={handleFilterChange}
        />
      </div>
      <Separator></Separator>
      <div className="space-y-3 mt-2">
        {isLoading ? (
          <TrendingBookSkeleton />
        ) : (
          <TrendingBookContent books={data || []} />
        )}
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RecommendBookSkeleton } from "@/app/share/components/ui/skeleton/skeleton";
import { TimeFrame } from "@/lib/timeCount";
import { getTrendingBooks } from "../api/recommendBook.api";
import RecommendBookContent from "./recommendBookContent";
import { Separator } from "@/components/ui/separator";
export default function RecommendBook() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["popularBooks"],
    queryFn: () => getTrendingBooks("month", 10), // có api thì thay cái ni hơi
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
    <div className="">
      <div className="flex flex-row gap-3 md:flex-col ">
        <span className="font-bold text-lg text-start  line-clamp-2">
          Những đầu truyện mà độc giả của tác phẩm này cũng xem
        </span>
      </div>
      <Separator />

      <div className="space-y-3 mt-2">
        {isLoading ? (
          <RecommendBookSkeleton />
        ) : (
          <RecommendBookContent books={data || []} />
        )}
      </div>
    </div>
  );
}

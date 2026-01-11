"use client";

import { useCallback, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  DEFAULT_TIMEFRAME,
  TimeFrame,
  normalizeTimeFrame,
} from "@/lib/timeCount";
import TrendingBookFilter from "./trendingBookFilter";
import TrendingBookContent from "./tredingBookContent";
import { getTrendingBooks } from "../api/books-trending.api";
import { BookCardProps } from "../../books/types/books.type";
import { TrendingBookSkeleton } from "@/app/share/components/ui/skeleton/skeleton";

interface TrendingBookClientProps {
  period?: TimeFrame | string | string[];
  limit?: number;
  title?: string;
}

export default function TrendingBookClient({
  period = DEFAULT_TIMEFRAME,
  limit = 5,
  title = "Xu hướng",
}: TrendingBookClientProps) {
  const [currentPeriod, setCurrentPeriod] = useState<TimeFrame>(
    normalizeTimeFrame(period, DEFAULT_TIMEFRAME)
  );
  const [books, setBooks] = useState<BookCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadBooks = useCallback(
    async (nextPeriod: TimeFrame) => {
      setLoading(true);
      setHasError(false);
      try {
        const data = await getTrendingBooks(nextPeriod, limit);
        setBooks(data ?? []);
      } catch (error) {
        console.error("Failed to load trending books:", error);
        setBooks([]);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    setCurrentPeriod(normalizeTimeFrame(period, DEFAULT_TIMEFRAME));
  }, [period]);

  useEffect(() => {
    loadBooks(currentPeriod);
  }, [currentPeriod, loadBooks]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between">
        <span className="font-bold text-lg text-start whitespace-nowrap">
          {title}
        </span>
        <TrendingBookFilter
          value={currentPeriod}
          onChange={setCurrentPeriod}
          syncToUrl={false}
        />
      </div>
      <Separator />
      {loading ? (
        <TrendingBookSkeleton></TrendingBookSkeleton>
      ) : hasError ? (
        <></>
      ) : (
        books.length && (
          <div className="space-y-3 mt-2">
            <TrendingBookContent books={books} />
          </div>
        )
      )}
    </div>
  );
}

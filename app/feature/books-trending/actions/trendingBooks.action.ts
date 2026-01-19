"use server";

import { handleActionRequest } from "@/lib/handleActionRequest";
import {
  DEFAULT_TIMEFRAME,
  TimeFrame,
  normalizeTimeFrame,
} from "@/lib/timeCount";
import { BookCardProps } from "../../books/types/books.type";

const TRENDING_REVALIDATE_SECONDS =3600;

interface GetTrendingBooksOptions {
  period?: TimeFrame | string | string[];
  limit?: number;
  revalidate?: number;
}

export async function getTrendingBooksAction(
  options: GetTrendingBooksOptions = {}
) {
  const { period, limit = 5, revalidate = TRENDING_REVALIDATE_SECONDS } =
    options;

  const normalizedPeriod = normalizeTimeFrame(period, DEFAULT_TIMEFRAME);

  return handleActionRequest<BookCardProps[]>(
    `/books/trending?period=${normalizedPeriod}&limit=${limit}`,
    {
      revalidate,
    }
  );
}


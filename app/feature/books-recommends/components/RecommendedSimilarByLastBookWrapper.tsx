"use client";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import RecommendedPersonalByLastBook from "./RecommendedSimilarByLastBook";

export default function RecommendedSimilarByLastBookWrapper() {
  const latestEntry = useReaderDataStore(
    (state) => state.readingHistory[0] ?? null
  );

  if (!latestEntry || !latestEntry.bookId) {
    return null;
  }

  return (
    <RecommendedPersonalByLastBook
      bookId={latestEntry.bookId}
      bookTitle={latestEntry.bookTitle}
    />
  );
}

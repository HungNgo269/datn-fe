"use client";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import RecommendedPersonalByLastBook from "./RecommendedSimilarByLastBook";

export default function RecommendedSimilarByLastBookWrapper() {
  const history = useReaderDataStore((state) => state.readingHistory);
  const bookId = history[0]?.bookId ?? null;
  const bookTitle = history[0]?.bookTitle ?? null;
  return (
    <RecommendedPersonalByLastBook bookId={bookId ?? 0} bookTitle={bookTitle} />
  );
}

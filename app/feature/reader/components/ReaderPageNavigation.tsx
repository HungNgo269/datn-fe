"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReaderPageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
}

export default function ReaderPageNavigation({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  canGoPrev = true,
  canGoNext = true,
}: ReaderPageNavigationProps) {
  const buttonBase =
    "rounded-full p-3 shadow-lg backdrop-blur-sm transition-all disabled:cursor-not-allowed disabled:opacity-30";
  const prevTitle =
    currentPage > 1
      ? `Trang ${Math.max(currentPage - 1, 1)}`
      : "Chương trước hoặc quay lại sách";
  const nextTitle =
    totalPages > 0 && currentPage < totalPages
      ? `Trang ${currentPage + 1}`
      : "Chương sau hoặc quay lại sách";

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="pointer-events-auto flex w-full flex-row justify-between px-10">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={`${buttonBase} reader-floating-action hover:cursor-pointer`}
          title={prevTitle}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`${buttonBase} reader-floating-action hover:cursor-pointer`}
          title={nextTitle}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

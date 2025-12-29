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
    "p-3 rounded-full backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg";
  const prevTitle =
    currentPage > 1
      ? `Trang ${Math.max(currentPage - 1, 1)}`
      : "Chương trước hoặc quay lại sách";
  const nextTitle =
    totalPages > 0 && currentPage < totalPages
      ? `Trang ${currentPage + 1}`
      : "Chương sau hoặc quay lại sách";
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="flex flex-row w-full justify-between pointer-events-auto px-10">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={`${buttonBase} reader-floating-action hover:cursor-pointer`}
          title={prevTitle}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`${buttonBase} reader-floating-action hover:cursor-pointer`}
          title={nextTitle}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

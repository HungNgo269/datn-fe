"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReaderPageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function ReaderPageNavigation({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: ReaderPageNavigationProps) {
  const buttonBase =
    "p-3 rounded-full backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg";
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="flex flex-row w-full justify-between pointer-events-auto px-10">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className={`${buttonBase} reader-floating-action`}
          title="Trang trước"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={`${buttonBase} reader-floating-action`}
          title="Trang sau"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

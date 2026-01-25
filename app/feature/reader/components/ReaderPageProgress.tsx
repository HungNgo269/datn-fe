"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface ReaderPageProgressProps {
  currentPage: number;
  totalPages: number;
  onChangePage: (page: number) => void;
  themeBg?: string;
  isDarkTheme?: boolean;
}

export default function ReaderPageProgress({
  currentPage,
  totalPages,
  onChangePage,
  themeBg,
  isDarkTheme,
}: ReaderPageProgressProps) {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(currentPage, 1), safeTotal);
  const [draftPage, setDraftPage] = useState(safeCurrent);

  useEffect(() => {
    setDraftPage(safeCurrent);
  }, [safeCurrent]);

  const safeDraft = Math.min(Math.max(draftPage, 1), safeTotal);
  const percentage = Math.round((safeDraft / safeTotal) * 100);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextPage = event.target.valueAsNumber;
    if (!Number.isNaN(nextPage)) {
      setDraftPage(nextPage);
    }
  };

  const commitPage = useCallback(() => {
    if (safeDraft !== safeCurrent) {
      onChangePage(safeDraft);
    }
  }, [onChangePage, safeCurrent, safeDraft]);

  const progressStyle = useMemo(() => {
    return {
      "--reader-progress": `${percentage}%`,
    } as CSSProperties;
  }, [percentage]);

  const barBg = themeBg ? toRgba(themeBg, 0.85) : undefined;

  if (totalPages <= 1) return null;

  return (
    <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-20 flex justify-center">
      <div
        className={cn(
          "pointer-events-auto w-[min(680px,92%)] rounded-full border border-border/70 px-4 py-2 shadow-sm backdrop-blur",
          !barBg && "bg-card",
          isDarkTheme ? "text-gray-200" : "text-gray-700",
        )}
        style={barBg ? { backgroundColor: barBg } : undefined}
      >
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={safeTotal}
            value={safeDraft}
            onChange={handleChange}
            onPointerUp={commitPage}
            onKeyUp={commitPage}
            onBlur={commitPage}
            className="reader-progress-range"
            style={progressStyle}
            aria-label="Reading progress"
          />
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {safeDraft}/{safeTotal}
          </span>
        </div>
      </div>
    </div>
  );
}

function toRgba(color: string, alpha: number) {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const value = parseInt(normalized, 16);
    if (Number.isNaN(value)) return color;
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const rgbMatch = trimmed.match(
    /^rgba?\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*(?:,\s*([0-9.]+)\s*)?\)$/,
  );
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return color;
}

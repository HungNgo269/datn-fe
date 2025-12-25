"use client";

import { sort_OPTIONS_time, TimeFrame } from "@/lib/timeCount";

interface TrendingBookFilterProps {
  value: TimeFrame;
  onFilterChange: (timeframe: TimeFrame) => void;
}

export default function TrendingBookFilter({
  value,
  onFilterChange,
}: TrendingBookFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative min-w-fit flex flex-row gap-1">
        {sort_OPTIONS_time.map((option) => (
          <span
            key={option.id}
            onClick={() => onFilterChange(option.name as TimeFrame)}
            className={`cursor-pointer select-none text-xs transition-all duration-200
              ${
                value === option.name ? "text-primary" : "text-muted-foreground"
              }
            `}
          >
            {option.name}
          </span>
        ))}
      </div>
    </div>
  );
}

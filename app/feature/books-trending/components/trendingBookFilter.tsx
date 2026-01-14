"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useTransition } from "react";
import {
  DEFAULT_TIMEFRAME,
  sort_OPTIONS_time,
  TimeFrame,
} from "@/lib/timeCount";

interface TrendingBookFilterProps {
  value: TimeFrame;
  paramKey?: string;
  onChange?: (timeframe: TimeFrame) => void;
  syncToUrl?: boolean;
}

function TrendingBookFilterContent({
  value,
  paramKey = "trendingPeriod",
  onChange,
  syncToUrl = true,
}: TrendingBookFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (timeframe: TimeFrame) => {
    if (timeframe === value) return;

    if (!syncToUrl) {
      onChange?.(timeframe);
      return;
    }

    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString());

      if (timeframe === DEFAULT_TIMEFRAME) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, timeframe);
      }

      const query = params.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(nextUrl, { scroll: false });
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative min-w-fit flex flex-row gap-1">
        {sort_OPTIONS_time.map((option) => {
          const timeframe = option.value as TimeFrame;
          const isActive = value === timeframe;

          return (
            <button
              type="button"
              key={option.id}
              onClick={() => updateFilter(timeframe)}
              disabled={isPending}
              className={`cursor-pointer select-none text-xs transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground"
              } ${isPending ? "opacity-60" : ""}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TrendingBookFilter(props: TrendingBookFilterProps) {
  return (
    <Suspense fallback={<div className="h-5 w-full" />}>
      <TrendingBookFilterContent {...props} />
    </Suspense>
  );
}

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResultSectionProps {
  title: string;
  count: number;
  children: ReactNode;
  emptyMessage?: string;
  hideIfEmpty?: boolean;
  className?: string;
  actionSlot?: ReactNode;
}

export function ResultSection({
  title,
  count,
  children,
  emptyMessage = "",
  hideIfEmpty = false,
  className,
  actionSlot,
}: ResultSectionProps) {
  if (count === 0 && hideIfEmpty) return null;

  return (
    <section className={cn("space-y-4 rounded-2xl border border-border/60 bg-card/70 p-5", className)}>
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {count}
          </span>
        </h2>
        {actionSlot}
      </div>
      {count > 0 ? (
        children
      ) : (
        <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
      )}
    </section>
  );
}

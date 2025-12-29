"use client";

import { cn } from "@/lib/utils";

interface HighlightedTextProps {
  text?: string | null;
  query: string;
  fallback?: string;
  className?: string;
}

export function HighlightedText({
  text,
  query,
  fallback,
  className,
}: HighlightedTextProps) {
  if (!text) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {fallback ?? "Updating soon"}
      </span>
    );
  }

  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return <span className={className}>{text}</span>;
  }

  const escapedQuery = escapeRegExp(normalizedQuery);
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-100 px-0.5 text-foreground font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </span>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

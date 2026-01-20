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
          <span key={`${part}-${index}`} className="font-bold text-primary">
            {part}
          </span>
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

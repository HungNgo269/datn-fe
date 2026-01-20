"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface BookDescProps {
  content?: string;
  className?: string;
  collapsedHeight?: number;
}

export default function BookDesc({
  content = "",
  className = "",
  collapsedHeight = 150,
}: BookDescProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  const sanitizedContent = useMemo(() => sanitizeRichHtml(content), [content]);
  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div
        className="relative w-full overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded ? "none" : `${collapsedHeight}px`,
        }}
      >
        {sanitizedContent ? (
          <div
            className="prose prose-sm w-full max-w-none break-words text-justify text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Chưa có mô tả cho sách này.
          </p>
        )}

        {!isExpanded && (
          <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      <button
        onClick={handleToggle}
        className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline focus:outline-none"
      >
        {isExpanded ? (
          <>
            Thu gọn <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            Xem thêm <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  const sanitizedContent = DOMPurify.sanitize(content);

  if (!content) return null;

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div
        className="relative w-full overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded ? "none" : `${collapsedHeight}px`,
        }}
      >
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {!isExpanded && (
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:underline focus:outline-none transition-colors"
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

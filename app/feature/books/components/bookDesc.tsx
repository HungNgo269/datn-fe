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

  if (!content) return null;

  // === BƯỚC QUAN TRỌNG NHẤT: XỬ LÝ DỮ LIỆU ===
  // Thay thế toàn bộ ký tự &nbsp; thành dấu cách thông thường " "
  // Điều này giúp trình duyệt hiểu đây là các từ rời rạc và tự động xuống dòng.
  const contentWithNormalSpaces = content.replace(/&nbsp;/g, " ");

  const sanitizedContent = DOMPurify.sanitize(contentWithNormalSpaces);

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div
        className="relative w-full overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded ? "none" : `${collapsedHeight}px`,
        }}
      >
        <div
          // Bây giờ dữ liệu đã sạch, ta dùng CSS chuẩn để hiển thị đẹp:
          // 1. whitespace-normal: Xuống dòng tự nhiên ở dấu cách.
          // 2. break-words: Chỉ cắt dòng nếu gặp từ siêu dài (như link URL).
          // 3. text-justify: Căn đều 2 bên cho đẹp mắt (giống sách).
          className="prose prose-sm max-w-none text-foreground leading-relaxed w-full whitespace-normal break-words text-justify"
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

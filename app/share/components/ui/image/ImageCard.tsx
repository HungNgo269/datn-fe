"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface ImageCardProps {
  bookImage?: string | null;
  bookName: string;
  priority?: boolean;
}

const PROXY_IMAGE_ROUTE = "/api/view-image";
const FALLBACK_IMAGE = "/images/sachFallBack.jpg";

function normalizeSrc(src?: string | null) {
  if (!src) return;
  const trimmed = src.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `${PROXY_IMAGE_ROUTE}?key=${encodeURIComponent(trimmed)}`;
}

export default function ImageCard({
  bookImage,
  bookName,
  priority = false,
}: ImageCardProps) {
  const normalizedSrc = useMemo(() => normalizeSrc(bookImage), [bookImage]);
  const [hasError, setHasError] = useState(false);
  const imgSrc = hasError
    ? FALLBACK_IMAGE
    : normalizedSrc ?? FALLBACK_IMAGE;

  useEffect(() => {
    setHasError(false);
  }, [normalizedSrc]);

  const handleError = () => {
    if (!hasError && imgSrc !== FALLBACK_IMAGE) {
      setHasError(true);
    }
  };

  const bypassOptimization = /^https?:\/\//i.test(imgSrc);

  return (
    <Image
      src={imgSrc}
      alt={bookName || "Book cover"}
      width={400}
      height={600}
      priority={priority}
      unoptimized={bypassOptimization}
      onError={handleError}
      sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 200px"
      className="object-cover duration-500 group-hover:scale-[102%] transition-transform h-full w-full"
    />
  );
}

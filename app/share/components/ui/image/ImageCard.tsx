"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageCardProps {
  bookImage: string;
  bookName: string;
  priority?: boolean;
}

const FALLBACK_SRC = "/images/sachFallback.jpg";

function normalizeSrc(src?: string | null) {
  if (!src) return FALLBACK_SRC;
  const trimmed = src.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed.replace(/^\/+/, "")}`;
}

export default function ImageCard({
  bookImage,
  bookName,
  priority = false,
}: ImageCardProps) {
  const [imgSrc, setImgSrc] = useState(() => normalizeSrc(bookImage));

  useEffect(() => {
    setImgSrc(normalizeSrc(bookImage));
  }, [bookImage]);

  const handleError = () => {
    if (imgSrc !== FALLBACK_SRC) {
      setImgSrc(FALLBACK_SRC);
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

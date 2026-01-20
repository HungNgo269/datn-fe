// components/ImageCard.tsx - CỰC KỲ ĐỠN GIẢN
"use client";

import Image from "next/image";
import { useState } from "react";
import { getValidImageUrl } from "@/lib/utils";

interface ImageCardProps {
  bookImage?: string | null;
  bookName: string;
  priority?: boolean;
}

export default function ImageCard({
  bookImage,
  bookName,
  priority = false,
}: ImageCardProps) {
  const [error, setError] = useState(false);

  // getValidImageUrl now returns full URLs from backend
  const normalizedImage = getValidImageUrl(bookImage);
  const src = error || !normalizedImage
    ? "/images/sachFallBack.jpg"
    : normalizedImage;

  return (
    <Image
      src={src}
      alt={bookName}
      width={400}
      height={600}
      priority={priority}
      onError={() => setError(true)}
      sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 200px"
      className="object-cover duration-500 group-hover:scale-[102%] transition-transform h-full w-full"
    />
  );
}

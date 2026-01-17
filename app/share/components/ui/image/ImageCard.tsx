// components/ImageCard.tsx - CỰC KỲ ĐỠN GIẢN
"use client";

import Image from "next/image";
import { useState } from "react";
import { getValidImageUrl } from "@/lib/utils";

interface ImageCardProps {
  bookImage?: string | null; // VD: "uploads/avatars/c1ee9840-589c-4d10-98d6-f75eb2228002.jpg"
  bookName: string;
  priority?: boolean;
}

export default function ImageCard({
  bookImage,
  bookName,
  priority = false,
}: ImageCardProps) {
  const [error, setError] = useState(false);

  const normalizedImage = getValidImageUrl(bookImage);
  const isAbsoluteUrl =
    normalizedImage?.startsWith("http://") ||
    normalizedImage?.startsWith("https://");
  const isLocalPath = normalizedImage?.startsWith("/");
  const src = error || !normalizedImage
    ? "/images/sachFallBack.jpg"
    : isAbsoluteUrl || isLocalPath
      ? normalizedImage
      : `/api/view-image?key=${encodeURIComponent(normalizedImage)}`;

  return (
    <Image
      src={src}
      alt={bookName}
      width={400}
      height={600}
      priority={priority}
      unoptimized
      onError={() => setError(true)}
      sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 200px"
      className="object-cover duration-500 group-hover:scale-[102%] transition-transform h-full w-full"
    />
  );
}

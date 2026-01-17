// components/ImageCard.tsx - CỰC KỲ ĐỠN GIẢN
"use client";

import Image from "next/image";
import { useState } from "react";

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

  const isUrl = bookImage?.startsWith("http");
  const src = error || !bookImage
    ? "/images/sachFallBack.jpg"
    : isUrl
      ? bookImage
      : `/api/view-image?key=${encodeURIComponent(bookImage)}`;

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
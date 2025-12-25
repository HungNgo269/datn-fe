import Image from "next/image";

interface ImageCardProps {
  bookImage: string;
  bookName: string;
  priority?: boolean;
}

export default function ImageCard({
  bookImage,
  bookName,
  priority = false,
}: ImageCardProps) {
  return (
    <Image
      src={bookImage || "/images/sachFallback.jpg"}
      alt={bookName || "Lỗi rồi người ơi"}
      fill
      sizes="100%"
      priority={priority}
      unoptimized
      className="object-cover duration-500 group-hover:scale-[102%] transition-transform"
    />
  );
}

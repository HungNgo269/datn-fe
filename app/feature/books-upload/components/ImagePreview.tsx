import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getValidImageUrl } from "@/lib/utils";

interface ImagePreviewProps {
  src: string;
  alt: string;
  onRemove: (e: React.MouseEvent) => void;
  className?: string;
}

export function ImagePreview({ src, alt, onRemove, className = "" }: ImagePreviewProps) {
  // Normalize the src - handles blob URLs, full public URLs, and keys
  const normalizedSrc = src.startsWith("blob:") ? src : getValidImageUrl(src);
  
  return (
    <div className={`relative group w-full aspect-[2/3] rounded-md overflow-hidden shadow-sm border border-border ${className}`}>
      <Image
        src={normalizedSrc}
        alt={alt}
        fill
        className="object-cover transition-transform group-hover:scale-105"
      />

      <div className="absolute inset-0 image-preview-overlay opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 rounded-full"
          title="Xóa ảnh"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

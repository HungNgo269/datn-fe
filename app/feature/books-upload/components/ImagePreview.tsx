import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  alt: string;
  onRemove: () => void;
}

export function ImagePreview({ src, alt, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative group w-full max-w-[200px] aspect-[2/3] rounded-md overflow-hidden shadow-sm border border-border">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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

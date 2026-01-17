"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface PurchaseChapterWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle: string;
  bookCoverImage: string;
  bookSlug: string;
  chapterTitle: string;
  chapterOrder: number;
  chapterPrice?: number;
}

export function PurchaseChapterWarningModal({
  open,
  onOpenChange,
  bookTitle,
  bookCoverImage,
  bookSlug,
  chapterTitle,
  chapterOrder,
  chapterPrice = 167,
}: PurchaseChapterWarningModalProps) {
  const router = useRouter();

  const handlePurchase = () => {
    // Navigate to book page where user can purchase
    router.push(`/books/${bookSlug}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] bg-white dark:bg-slate-900 text-foreground border border-border p-8 shadow-2xl backdrop-blur-xl"
        showCloseButton={false}
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full bg-muted hover:bg-muted/80 p-2 transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Title */}
          <DialogTitle asChild>
            <h2 className="text-2xl font-bold text-foreground">Thông báo</h2>
          </DialogTitle>

          {/* Description */}
          <p className="text-base text-muted-foreground">
            Bạn cần mua cuốn sách này để đọc toàn bộ nội dung
          </p>

          {/* Book Cover */}
          <div className="relative w-32 h-44 rounded-lg overflow-hidden shadow-xl border border-border">
            <Image
              src={bookCoverImage}
              alt={bookTitle}
              fill
              className="object-cover"
            />
          </div>

          {/* Book Title */}
          <h3 className="text-lg font-semibold text-foreground">{bookTitle}</h3>

          {/* Chapter Info */}
          <p className="text-primary text-base font-medium">
            Chương {chapterOrder}: {chapterTitle}
          </p>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            className="w-full max-w-sm h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full text-base shadow-lg"
          >
            Mua sách
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

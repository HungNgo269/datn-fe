"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import Image from "next/image";
import { BookPaymentActions } from "@/app/feature/payments/components/BookPaymentActions";

interface PurchaseChapterWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle: string;
  bookCoverImage: string;
  bookSlug: string;
  chapterTitle: string;
  chapterOrder: number;
  chapterPrice?: number;
  accessType?: string;
  bookId?: number;
}

export function PurchaseChapterWarningModal({
  open,
  onOpenChange,
  bookTitle,
  bookCoverImage,
  bookSlug,
  chapterTitle,
  chapterOrder,
  chapterPrice = 0,
  accessType,
  bookId
}: PurchaseChapterWarningModalProps) {
  const isMembership = accessType === "membership";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] bg-white dark:bg-slate-900 text-foreground border border-border p-8 shadow-2xl backdrop-blur-xl"
        showCloseButton={false}
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full bg-muted hover:bg-muted/80 p-2 transition-colors z-50"
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
            {isMembership 
              ? "Bạn cần đăng ký gói hội viên để đọc toàn bộ nội dung"
              : "Bạn cần mua cuốn sách này để đọc toàn bộ nội dung"
            }
          </p>

          {/* Book Cover */}
          <div className="relative w-32 h-44 rounded-lg overflow-hidden shadow-xl border border-border bg-muted">
            {bookCoverImage ? (
                <Image
                src={bookCoverImage}
                alt={bookTitle}
                fill
                className="object-cover"
                />
            ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    No Cover
                </div>
            )}
            
          </div>

          <div className="space-y-1">
             {/* Book Title */}
            <h3 className="text-lg font-semibold text-foreground px-4 line-clamp-2">{bookTitle}</h3>

            {/* Chapter Info */}
            <p className="text-primary text-base font-medium">
                Chương {chapterOrder}: {chapterTitle}
            </p>
          </div>

          {/* Purchase Button - Reusing Payment Action Logic */}
          {bookId && (
            <div className="w-full flex justify-center">
                 <BookPaymentActions 
                    bookId={bookId}
                    price={chapterPrice}
                    accessType={accessType || "PURCHASE"}
                    className="w-full max-w-sm rounded-full shadow-lg h-12 text-base"
                 />
            </div>
          )}
          
        </div>
      </DialogContent>
    </Dialog>
  );
}

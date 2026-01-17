"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SubscriptionWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle: string;
  bookCoverImage: string;
}

export function SubscriptionWarningModal({
  open,
  onOpenChange,
  bookTitle,
  bookCoverImage,
}: SubscriptionWarningModalProps) {
  const router = useRouter();

  const handleSubscribe = () => {
    // Navigate to subscription page
    router.push("/subscription");
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
            Để đọc hết nội dung cuốn sách này bạn cần nâng cấp gói hội viên Waka
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

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            className="w-full max-w-sm h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full text-base shadow-lg"
          >
            Trở thành hội viên
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { ReactNode, useEffect, useState } from "react";
import { PurchaseChapterWarningModal } from "./PurchaseChapterWarningModal";
import { SubscriptionWarningModal } from "./SubscriptionWarningModal";
import { useRouter } from "next/navigation";

interface ChapterAccessGuardProps {
  hasAccess: boolean;
  bookId?: number;
  bookTitle: string;
  bookCoverImage: string;
  bookSlug: string;
  chapterTitle: string;
  chapterOrder: number;
  chapterPrice?: number;
  accessType?: string;
  children: ReactNode;
}

export function ChapterAccessGuard({
  hasAccess,
  bookId,
  bookTitle,
  bookCoverImage,
  bookSlug,
  chapterTitle,
  chapterOrder,
  chapterPrice,
  accessType,
  children,
}: ChapterAccessGuardProps) {
  const router = useRouter();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    // If user doesn't have access, show the appropriate modal
    if (!hasAccess) {
      if (accessType === 'membership') {
        setShowSubscriptionModal(true);
      } else {
        setShowPurchaseModal(true);
      }
    }
  }, [hasAccess, accessType]);

  const handleModalClose = (modalType: 'purchase' | 'subscription') => {
    if (modalType === 'purchase') {
      setShowPurchaseModal(false);
    } else {
      setShowSubscriptionModal(false);
    }
    // Navigate back to book page when modal is closed
    router.push(`/books/${bookSlug}`);
  };

  return (
    <>
      {children}
      {!hasAccess && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
             <PurchaseChapterWarningModal
               open={showPurchaseModal}
               onOpenChange={(open) => {
                 if (!open) handleModalClose('purchase');
               }}
               bookId={bookId}
               bookTitle={bookTitle}
               bookCoverImage={bookCoverImage}
               bookSlug={bookSlug}
               chapterTitle={chapterTitle}
               chapterOrder={chapterOrder}
               chapterPrice={chapterPrice}
             />

             <SubscriptionWarningModal
               open={showSubscriptionModal}
               onOpenChange={(open) => {
                 if (!open) handleModalClose('subscription');
               }}
               bookTitle={bookTitle}
               bookCoverImage={bookCoverImage}
             />
           </div>
      )}
    </>
  );
}

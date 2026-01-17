"use client";

import { ReactNode, useEffect, useState } from "react";
import { PurchaseChapterWarningModal } from "./PurchaseChapterWarningModal";
import { SubscriptionWarningModal } from "./SubscriptionWarningModal";
import { useRouter } from "next/navigation";

interface ChapterAccessGuardProps {
  hasAccess: boolean;
  bookTitle: string;
  bookCoverImage: string;
  bookSlug: string;
  chapterTitle: string;
  chapterOrder: number;
  accessType?: string;
  children: ReactNode;
}

export function ChapterAccessGuard({
  hasAccess,
  bookTitle,
  bookCoverImage,
  bookSlug,
  chapterTitle,
  chapterOrder,
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

  // If user has access, render the chapter content
  if (hasAccess) {
    return <>{children}</>;
  }

  // If user doesn't have access, render empty div with modals
  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center">
      <PurchaseChapterWarningModal
        open={showPurchaseModal}
        onOpenChange={(open) => {
          if (!open) handleModalClose('purchase');
        }}
        bookTitle={bookTitle}
        bookCoverImage={bookCoverImage}
        bookSlug={bookSlug}
        chapterTitle={chapterTitle}
        chapterOrder={chapterOrder}
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
  );
}

"use client";

import { useBookAudioStore } from "@/app/store/useBookAudioStore";
import { PurchaseRequiredDialog } from "./PurchaseRequiredDialog";

/**
 * Wrapper component that manages the purchase required dialog
 * This should be placed at the app level to handle dialog display
 */
export function BookAudioDialogManager() {
  const isPurchaseDialogOpen = useBookAudioStore(
    (state) => state.isPurchaseDialogOpen
  );
  const purchaseDialogAccessType = useBookAudioStore(
    (state) => state.purchaseDialogAccessType
  );
  const currentTrack = useBookAudioStore((state) => state.currentTrack);
  const hidePurchaseDialog = useBookAudioStore(
    (state) => state.hidePurchaseDialog
  );

  return (
    <PurchaseRequiredDialog
      open={isPurchaseDialogOpen}
      onOpenChange={hidePurchaseDialog}
      accessType={purchaseDialogAccessType}
      bookId={currentTrack?.id}
    />
  );
}

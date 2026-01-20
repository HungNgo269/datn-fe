"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PurchaseRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessType: "purchase" | "membership";
  bookId?: string;
}

export function PurchaseRequiredDialog({
  open,
  onOpenChange,
  accessType,
  bookId,
}: PurchaseRequiredDialogProps) {
  const router = useRouter();

  const handlePurchase = () => {
    onOpenChange(false);
    if (accessType === "membership") {
      router.push("/membership");
    } else if (bookId) {
      router.push(`/books/${bookId}`);
    }
  };

  const title =
    accessType === "membership"
      ? "Yêu cầu hội viên"
      : "Yêu cầu mua sách";

  const description =
    accessType === "membership"
      ? "Bạn cần đăng ký hội viên để nghe chương này. Hội viên sẽ có quyền truy cập tất cả nội dung audio của các sách trong thư viện."
      : "Bạn cần mua sách để nghe chương này. Sau khi mua, bạn sẽ có quyền truy cập vĩnh viễn vào tất cả các chương của sách.";

  const confirmText =
    accessType === "membership" ? "Đăng ký hội viên" : "Mua sách";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
          <AlertDialogAction onClick={handlePurchase}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

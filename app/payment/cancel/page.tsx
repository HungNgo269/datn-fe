"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const RETURN_STORAGE_KEY = "payment:return";

export default function PaymentCancelPage() {
  const router = useRouter();

  const returnPath = useMemo(() => {
    let targetPath = "/books";
    try {
      const storedPath = localStorage.getItem(RETURN_STORAGE_KEY);
      if (storedPath && storedPath.startsWith("/")) {
        targetPath = storedPath;
      }
    } catch {}
    return targetPath;
  }, []);

  useEffect(() => {
    toast.error("Thanh toán đã bị hủy.", { position: "top-center" });
  }, []);

  const handleBack = () => {
    try {
      localStorage.removeItem(RETURN_STORAGE_KEY);
    } catch {}
    router.replace(returnPath);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">
          Thanh toán chưa hoàn tất
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bạn có thể quay lại sách để thử thanh toán lại khi sẵn sàng.
        </p>
        <Button className="mt-6 w-full" onClick={handleBack}>
          Quay lại
        </Button>
      </div>
    </div>
  );
}

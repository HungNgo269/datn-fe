"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const RETURN_STORAGE_KEY = "payment:return";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    let targetPath = "/books";
    try {
      const storedPath = localStorage.getItem(RETURN_STORAGE_KEY);
      if (storedPath && storedPath.startsWith("/")) {
        targetPath = storedPath;
      }
      localStorage.removeItem(RETURN_STORAGE_KEY);
    } catch {}

    toast.success("Thanh toán thành công.", { position: "top-center" });
    const timer = window.setTimeout(() => {
      router.replace(targetPath);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}

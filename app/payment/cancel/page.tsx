"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const RETURN_STORAGE_KEY = "payment:return";
const PAYMENT_TYPE_KEY = "payment:type";
const DEFAULT_RETURN_PATH = "/books";

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    let returnPath = DEFAULT_RETURN_PATH;
    try {
      const stored = localStorage.getItem(RETURN_STORAGE_KEY);
      if (stored && stored.startsWith("/")) {
        returnPath = stored;
      }
      localStorage.removeItem(RETURN_STORAGE_KEY);
      localStorage.removeItem(PAYMENT_TYPE_KEY);
    } catch {}

    router.replace(returnPath);
  }, [router]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/useAuthStore";

const RETURN_STORAGE_KEY = "payment:return";
const PAYMENT_TYPE_KEY = "payment:type";
const PAYMENT_SUCCESS_KEY = "payment:success";
const DEFAULT_RETURN_PATH = "/books";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    let returnPath = DEFAULT_RETURN_PATH;
    try {
      const stored = localStorage.getItem(RETURN_STORAGE_KEY);
      if (stored && stored.startsWith("/")) {
        returnPath = stored;
      }
      localStorage.removeItem(RETURN_STORAGE_KEY);

      const paymentType = localStorage.getItem(PAYMENT_TYPE_KEY);
      if (paymentType === "subscription") {
        useAuthStore.getState().setSubscriptionPlan("PREMIUM");
      }
      localStorage.removeItem(PAYMENT_TYPE_KEY);
      localStorage.setItem(PAYMENT_SUCCESS_KEY, "1");
    } catch {}

    toast.success("Thanh toán thành công");
    router.replace(returnPath);
  }, [router]);

  return null;
}

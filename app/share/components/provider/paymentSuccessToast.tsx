"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const PAYMENT_SUCCESS_KEY = "payment:success";

export default function PaymentSuccessToast() {
  useEffect(() => {
    try {
      const flag = localStorage.getItem(PAYMENT_SUCCESS_KEY);
      if (flag) {
        localStorage.removeItem(PAYMENT_SUCCESS_KEY);
        toast.success("Thanh toán thành công");
      }
    } catch {}
  }, []);

  return null;
}

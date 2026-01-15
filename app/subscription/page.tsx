"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { createSubscriptionCheckout } from "@/app/feature/payments/api/payments.api";

const RETURN_STORAGE_KEY = "payment:return";
const PAYMENT_TYPE_KEY = "payment:type";

function SubscriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const returnPath = useMemo(() => {
    const rawReturn = searchParams.get("return");
    if (rawReturn && rawReturn.startsWith("/")) {
      return rawReturn;
    }
    return "/books";
  }, [searchParams]);

  const handleSubscribe = async () => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      router.push(
        `/login?next=${encodeURIComponent(
          `/subscription?return=${encodeURIComponent(returnPath)}`
        )}`
      );
      return;
    }

    setIsLoading(true);
    try {
      try {
        localStorage.setItem(RETURN_STORAGE_KEY, returnPath);
        localStorage.setItem(PAYMENT_TYPE_KEY, "subscription");
      } catch {}

      const response = await createSubscriptionCheckout("PREMIUM");
      if (response?.checkoutUrl) {
        window.location.assign(response.checkoutUrl);
        return;
      }
      toast.error("Không tạo được đường dẫn thanh toán.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không tạo được gói hội viên."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16 pt-24">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Gọi hội viên
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            Mở khóa toàn bộ sách trả phí
          </h1>
        </div>

        <div className="rounded-xl border border-border/60 p-6 shadow-sm">
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Đọc tất cả các chương trả phí .</li>
            <li>Có thể truy cập trên mọi thiết bị.</li>
            <li>Hỗ trợ đa nền tảng.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={handleSubscribe} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Đăng kí hội viên"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SubscriptionPageContent />
    </Suspense>
  );
}

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/app/store/useAuthStore";

interface BookAccessButtonProps {
  slug: string;
  isFree: boolean;
  priceLabel: string;
  requiresPayment: boolean;
}

export function BookAccessButton({
  slug,
  isFree,
  priceLabel,
  requiresPayment,
}: BookAccessButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleClick = useCallback(() => {
    if (!requiresPayment) {
      router.push(`/books/${slug}`);
      return;
    }

    const paymentUrl = `/payment?book=${slug}`;
    if (isAuthenticated) {
      router.push(paymentUrl);
      return;
    }

    router.push(`/login?next=${encodeURIComponent(paymentUrl)}`);
  }, [isAuthenticated, requiresPayment, router, slug]);

  return (
    <Button
      type="button"
      variant={isFree ? "outline" : "default"}
      className={cn(
        "h-9 text-xs font-semibold tracking-wide",
        isFree
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
      onClick={handleClick}
    >
      {isFree ? "FREE" : priceLabel}
    </Button>
  );
}

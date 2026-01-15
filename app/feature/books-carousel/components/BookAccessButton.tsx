"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const handleClick = useCallback(() => {
    router.push(`/books/${slug}`);
  }, [router, slug]);

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

"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, toNumericPrice } from "@/lib/helper";
import { useAuthStore } from "@/app/store/useAuthStore";
import { ApiError } from "@/lib/handleApiRequest";
import {
  createBookCheckout,
  createSubscriptionCheckout,
  getBookPurchaseStatus,
  getUserSubscription,
} from "../api/payments.api";
import type { SubscriptionStatus } from "../types/payment.type";
import { LoginRequiredDialog } from "@/app/share/components/ui/dialog/LoginRequiredDialog";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>([
  "ACTIVE",
  "PAST_DUE",
  "TRIALING",
]);
const RETURN_STORAGE_KEY = "payment:return";
const PAYMENT_TYPE_KEY = "payment:type";

interface BookPaymentActionsProps {
  bookId: number;
  accessType?: string | null;
  price?: number | string | null;
  className?: string;
}

function BookPaymentActionsContent({
  bookId,
  accessType,
  price,
  className,
}: BookPaymentActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const accessToken = Cookies.get("accessToken");
  const hasAuthToken = Boolean(accessToken);
  const isUserAuthenticated = isAuthenticated || hasAuthToken;

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{title: string, description: string}>({
    title: "Yêu cầu đăng nhập",
    description: "Bạn cần đăng nhập để thực hiện tính năng này."
  });

  const normalizedAccessType = accessType
    ? accessType.toString().toUpperCase()
    : "FREE";
  const isPurchase = normalizedAccessType === "PURCHASE";
  const isMembership = normalizedAccessType === "MEMBERSHIP";

  const [isLoading, setIsLoading] = useState(false);

  const currentPath = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const returnPath = useMemo(() => {
    const rawReturn = searchParams.get("return");
    if (rawReturn && rawReturn.startsWith("/")) {
      return rawReturn;
    }
    return currentPath;
  }, [currentPath, searchParams]);

  const shouldCheckPurchase = isPurchase && isUserAuthenticated;
  const shouldCheckSubscription = isMembership && isUserAuthenticated;

  const { data: purchaseStatus } = useQuery({
    queryKey: ["payment", "purchase", bookId],
    queryFn: async () => {
      try {
        return await getBookPurchaseStatus(bookId);
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          return null;
        }
        throw error;
      }
    },
    enabled: shouldCheckPurchase,
    staleTime: 60 * 1000,
    retry: false,
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ["payment", "subscription"],
    queryFn: async () => {
      try {
        return await getUserSubscription();
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          return null;
        }
        throw error;
      }
    },
    enabled: shouldCheckSubscription,
    staleTime: 60 * 1000,
    retry: false,
  });

  const isPurchased = purchaseStatus?.purchased ?? false;
  const subscriptionStatus = subscriptionData?.status ?? null;

  const hasActiveSubscription = useMemo(() => {
    if (user?.subscriptionPlan?.toUpperCase() === "PREMIUM") {
      return true;
    }
    return subscriptionStatus
      ? ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus)
      : false;
  }, [subscriptionStatus, user?.subscriptionPlan]);

  const priceValue = toNumericPrice(price);
  const priceLabel = priceValue > 0 ? formatCurrency(priceValue) : "Thanh toán";

  const handleCheckoutRedirect = useCallback(
    (checkoutUrl?: string | null) => {
      if (checkoutUrl) {
        try {
          localStorage.setItem(RETURN_STORAGE_KEY, returnPath);
        } catch {}
        window.location.assign(checkoutUrl);
      } else {
        toast.error("Không thể tạo đường dẫn thanh toán.");
      }
    },
    [returnPath]
  );

  const handlePurchase = useCallback(async () => {
    if (!isUserAuthenticated) {
      setDialogConfig({
        title: "Mua chương",
        description: "Bạn cần đăng nhập để mua sách này."
      });
      setShowLoginDialog(true);
      return;
    }

    if (isPurchased) {
      return;
    }

    setIsLoading(true);
    try {
      try {
        localStorage.setItem(PAYMENT_TYPE_KEY, "book");
      } catch {}
      const response = await createBookCheckout(bookId);
      handleCheckoutRedirect(response.checkoutUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể thanh toán sách."
      );
    } finally {
      setIsLoading(false);
    }
  }, [bookId, handleCheckoutRedirect, isPurchased, isUserAuthenticated]);

  const handleSubscription = useCallback(async () => {
    if (!isUserAuthenticated) {
      setDialogConfig({
        title: "Đăng ký hội viên",
        description: "Bạn cần đăng nhập để đăng ký gói hội viên."
      });
      setShowLoginDialog(true);
      return;
    }

    if (hasActiveSubscription) {
      return;
    }

    setIsLoading(true);
    try {
      try {
        localStorage.setItem(PAYMENT_TYPE_KEY, "subscription");
      } catch {}
      const response = await createSubscriptionCheckout("PREMIUM");
      handleCheckoutRedirect(response.checkoutUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo gói hội viên."
      );
    } finally {
      setIsLoading(false);
    }
  }, [handleCheckoutRedirect, hasActiveSubscription, isUserAuthenticated]);

  if (!isPurchase && !isMembership) {
    return null;
  }

  return (
    <>
      {isPurchase && (
        <Button
          type="button"
          onClick={handlePurchase}
          disabled={isLoading || isPurchased}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-border px-4 text-base font-semibold transition-all sm:w-auto",
            isPurchased 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 cursor-default hover:bg-emerald-500/10" 
              : "bg-primary text-primary-foreground",
            className
          )}
        >
          {isPurchased ? "Đã mua" : `Mua với ${priceLabel}`}
        </Button>
      )}

      {isMembership && (
        <Button
          type="button"
          onClick={handleSubscription}
          disabled={isLoading || hasActiveSubscription}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-border px-4 text-base font-semibold transition-all sm:w-auto",
            hasActiveSubscription
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 cursor-default hover:bg-emerald-500/10"
              : "bg-primary text-primary-foreground",
            className
          )}
        >
          {hasActiveSubscription ? "Đã sở hữu" : "Hội viên"}
        </Button>
      )}

      <LoginRequiredDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
        title={dialogConfig.title}
        description={dialogConfig.description}
      />
    </>
  );
}

export function BookPaymentActions(props: BookPaymentActionsProps) {
  return (
    <Suspense fallback={<div className="h-12 w-full" />}>
      <BookPaymentActionsContent {...props} />
    </Suspense>
  );
}


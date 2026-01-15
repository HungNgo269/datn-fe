"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, BadgeX, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  cancelUserSubscription,
  getUserSubscription,
} from "@/app/feature/payments/api/payments.api";
import type { UserSubscription } from "@/app/feature/payments/types/payment.type";
import { ApiError } from "@/lib/handleApiRequest";
import { Button } from "@/components/ui/button";

const ACTIVE_STATUSES = new Set<UserSubscription["status"]>([
  "ACTIVE",
  "PAST_DUE",
  "TRIALING",
]);

const formatDate = (value?: string) => {
  if (!value) return "Không rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ";
  return format(date, "MMM dd, yyyy");
};

const formatPlanLabel = (plan?: string | null) => {
  if (!plan) return "Miễn phí";
  return plan.toLowerCase() === "premium" ? "Premium" : plan;
};

const formatStatusLabel = (status?: string | null) => {
  if (!status) return "Không hoạt động";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function SubscriptionSection() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
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
    staleTime: 60 * 1000,
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelUserSubscription,
    onSuccess: () => {
      toast.success("Đã lên lịch hủy gói đăng ký.");
      queryClient.invalidateQueries({ queryKey: ["payment", "subscription"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Không thể hủy gói đăng ký."
      );
    },
  });

  const subscription = data ?? null;
  const hasActiveSubscription =
    subscription && ACTIVE_STATUSES.has(subscription.status);
  const isCancelPending = Boolean(subscription?.cancelAtPeriodEnd);

  return (
    <section className="rounded-2xl p-6 space-y-4">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Gói đăng ký
        </p>
        <h2 className="text-2xl font-semibold text-foreground mt-1">
          Quản lý gói của bạn
        </h2>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Đang tải thông tin gói đăng ký...
        </p>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Không thể tải thông tin gói đăng ký.
        </p>
      ) : !subscription ? (
        <p className="text-sm text-muted-foreground">
          Bạn hiện không có gói đăng ký đang hoạt động.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-border/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {hasActiveSubscription ? (
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
              ) : (
                <BadgeX className="h-4 w-4 text-destructive" />
              )}
              <span>{formatStatusLabel(subscription.status)}</span>
            </div>

            <p className="text-base font-semibold text-foreground">
              {formatPlanLabel(subscription.plan)}
            </p>

            <p className="text-sm text-muted-foreground">
              Chu kỳ hiện tại kết thúc vào{" "}
              {formatDate(subscription.currentPeriodEnd)}
            </p>

            {isCancelPending && (
              <p className="text-sm text-muted-foreground">
                Việc hủy sẽ được thực hiện khi kết thúc chu kỳ.
              </p>
            )}
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => cancelMutation.mutate()}
              disabled={
                !hasActiveSubscription ||
                isCancelPending ||
                cancelMutation.isPending
              }
            >
              {cancelMutation.isPending ? "Đang hủy..." : "Hủy gói đăng ký"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

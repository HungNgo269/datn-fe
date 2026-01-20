"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, BadgeX, CreditCard, Crown, Check, Loader2 } from "lucide-react";
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
  return format(date, "dd/MM/yyyy");
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
        error instanceof Error
          ? error.message
          : "Không thể hủy gói đăng ký."
      );
    },
  });

  const subscription = data ?? null;
  const hasActiveSubscription =
    subscription && ACTIVE_STATUSES.has(subscription.status);
  const isCancelPending = Boolean(subscription?.cancelAtPeriodEnd);

  return (
    <section className="space-y-4 rounded-2xl p-6">
      <header>
        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          Gói đăng ký
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-foreground">
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
        <div className="space-y-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Nâng cấp lên Hội viên Premium
            </h3>
            <p className="text-sm text-muted-foreground">
              Truy cập không giới hạn vào toàn bộ thư viện sách và audiobook của chúng tôi. 
              Tận hưởng trải nghiệm đọc sách không quảng cáo và nhiều tính năng độc quyền khác.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span>Truy cập không giới hạn tất cả sách</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span>Nghe audiobook chất lượng cao</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span>Không quảng cáo</span>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            asChild
          >
            <Link href="/subscription">
              Xem các gói hội viên
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Premium Subscription Card */}
          <div className="relative rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg overflow-hidden">
            {/* Crown Watermark */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Crown size={80} className="text-white" />
            </div>

            {/* Status Badge */}
            <div className="relative z-10 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {hasActiveSubscription ? (
                    <BadgeCheck className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <BadgeX className="h-5 w-5 text-rose-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    hasActiveSubscription ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatStatusLabel(subscription.status)}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold uppercase tracking-wider">
                  Premium
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                {formatPlanLabel(subscription.plan)}
              </h3>

              <div className="space-y-1.5 text-sm text-slate-300">
                <p>
                  Chu kỳ hiện tại kết thúc vào{" "}
                  <span className="text-white font-semibold">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </p>
                {isCancelPending && (
                  <p className="text-amber-400 font-medium">
                    ⚠️ Việc hủy sẽ được thực hiện khi kết thúc chu kỳ.
                  </p>
                )}
              </div>
            </div>

            {/* Features */}
            <ul className="relative z-10 space-y-2 mb-6 pb-6 border-b border-white/10">
              {[
                "Truy cập toàn bộ sách hội viên",
                "Nghe audiobook chất lượng cao",
                "Không quảng cáo",
                "Hỗ trợ tác giả yêu thích"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Action Button */}
            <div className="relative z-10">
              {!isCancelPending && hasActiveSubscription && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang hủy...
                    </>
                  ) : (
                    "Hủy gia hạn"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

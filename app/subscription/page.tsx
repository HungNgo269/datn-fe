"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  createSubscriptionCheckout,
  cancelUserSubscription,
  getUserSubscription,
} from "@/app/feature/payments/api/payments.api";
import { getActivePlans } from "@/app/feature/plans/api/plans.api";
import { Plan } from "@/app/feature/plans/types/plans.types";
import { useAuthStore } from "@/app/store/useAuthStore";
import Header from "../share/components/ui/header/header";
import FooterComponent from "../share/components/ui/footer/footer";
import { Check, X, Loader2, Crown } from "lucide-react";
import { UserSubscription } from "@/app/feature/payments/types/payment.type";
import { cn } from "@/lib/utils";

const RETURN_STORAGE_KEY = "payment:return";
const PAYMENT_TYPE_KEY = "payment:type";

// Free plan features (hardcoded)
const FREE_FEATURES = [
  { text: "Đọc các chương miễn phí", included: true },
  { text: "Mua lẻ từng cuốn sách", included: true },
  { text: "Truy cập toàn bộ sách hội viên", included: false },
  { text: "Không quảng cáo", included: false },
];

function SubscriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isLoading, setIsLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isFetchingSub, setIsFetchingSub] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isFetchingPlans, setIsFetchingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchSubscription = async () => {
        try {
          const sub = await getUserSubscription();
          setSubscription(sub);
        } catch (error) {
          console.error("Failed to fetch subscription", error);
        } finally {
          setIsFetchingSub(false);
        }
      };
      fetchSubscription();
    } else {
      setIsFetchingSub(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const activePlans = await getActivePlans();
        setPlans(activePlans);
        // Select first plan by default
        if (activePlans.length > 0) {
          setSelectedPlanId(activePlans[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch plans", error);
        toast.error("Không thể tải danh sách gói hội viên");
      } finally {
        setIsFetchingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async () => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      router.push(`/login?next=${encodeURIComponent("/subscription")}`);
      return;
    }

    setIsLoading(true);
    try {
      try {
        localStorage.setItem(RETURN_STORAGE_KEY, "/books");
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

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn hủy gói hội viên? Bạn vẫn có thể truy cập cho đến hết chu kỳ hiện tại."
      )
    )
      return;

    setIsCanceling(true);
    try {
      await cancelUserSubscription();
      toast.success("Đã hủy gia hạn gói hội viên thành công.");
      const sub = await getUserSubscription();
      setSubscription(sub);
    } catch (error) {
      toast.error("Không thể hủy gói hội viên. Vui lòng thử lại sau.");
    } finally {
      setIsCanceling(false);
    }
  };

  const isPremium =
    subscription?.status === "ACTIVE" || subscription?.status === "TRIALING";

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const formatPrice = (price: number) => {
    return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}đ`;
  };

  const formatInterval = (interval: string, intervalCount: number) => {
    const unit = interval === "MONTH" ? "tháng" : "năm";
    return `${intervalCount} ${unit}`;
  };

  if (isFetchingSub || isFetchingPlans) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="w-full max-w-[1200px] mx-auto">
            <Header />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
        </main>
        <FooterComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="w-full max-w-[1200px] mx-auto">
          <Header />
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-12 lg:py-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            NEXTBOOK PREMIUM
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Nâng tầm trải nghiệm đọc của bạn
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Mở khóa kho sách bản quyền không giới hạn và tận hưởng các tính năng độc
            quyền dành riêng cho hội viên.
          </p>
        </div>

        {/* Plan Duration Selector - REMOVED */}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free Plan Card */}
          <div className="relative rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Miễn phí
              </h3>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-slate-900">0đ</span>
                <span className="text-slate-500 text-sm">/tháng</span>
              </div>
              <p className="text-xs text-slate-600">
                Dành cho người mới bắt đầu khám phá NaviBook.
              </p>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {FREE_FEATURES.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  {feature.included ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                  )}
                  <span
                    className={cn(
                      "text-xs",
                      feature.included ? "text-slate-700" : "text-slate-400"
                    )}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              disabled
              className="w-full h-10 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed hover:bg-slate-100 text-sm"
            >
              Gói hiện tại
            </Button>
          </div>

          {/* Premium Plan Cards */}
          {plans.map((plan) => {
            const isCurrentPlan = isPremium && subscription?.plan === plan.plan;
            const isBestValue = plan.intervalCount === 12;

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl bg-slate-900 p-6 shadow-xl overflow-hidden flex flex-col"
              >
                {/* Crown Watermark */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Crown size={80} className="text-white" />
                </div>

                {/* Best Value Badge */}
                {isBestValue && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-2 py-1 rounded-lg text-xs bg-green-500 text-white font-bold uppercase tracking-wider shadow-lg">
                      Tiết kiệm nhất
                    </span>
                  </div>
                )}

                <div className="relative z-10 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {plan.name}
                    </h3>
                    {isCurrentPlan && (
                      <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider font-bold">
                        Đang dùng
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-bold text-white">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-slate-400 text-sm">
                      /{formatInterval(plan.interval, plan.intervalCount)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {plan.description || "Trải nghiệm đọc sách đỉnh cao không giới hạn."}
                  </p>
                </div>

                <ul className="space-y-2 mb-6 relative z-10 flex-1">
                  {(plan.features && plan.features.length > 0 
                    ? plan.features 
                    : [
                        "Truy cập toàn bộ sách hội viên",
                        "Không giới hạn chương đọc",
                        "Không quảng cáo làm phiền",
                        "Hỗ trợ tác giả yêu thích"
                      ]
                  ).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="space-y-3 relative z-10">
                    <div className="p-3 rounded-lg bg-white/10 border border-white/10 text-xs text-slate-300">
                      <p>Gói cước gia hạn tự động.</p>
                      {subscription?.currentPeriodEnd && (
                        <p className="mt-1">
                          Hết hạn vào:{" "}
                          <span className="text-white font-medium">
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString("vi-VN")}
                          </span>
                        </p>
                      )}
                      {subscription?.cancelAtPeriodEnd && (
                        <p className="mt-1 text-amber-400 font-medium">
                          Đã hủy gia hạn.
                        </p>
                      )}
                    </div>

                    {!subscription?.cancelAtPeriodEnd && (
                      <Button
                        onClick={handleCancelSubscription}
                        variant="destructive"
                        className="w-full h-10 rounded-xl font-medium bg-white/10 hover:bg-white/20 text-white border-0 text-sm"
                        disabled={isCanceling}
                      >
                        {isCanceling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang hủy...
                          </>
                        ) : (
                          "Hủy gia hạn"
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      handleSubscribe();
                    }}
                    className="w-full h-10 rounded-xl font-medium relative z-10 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-lg shadow-orange-500/30 text-sm"
                    disabled={isLoading || isPremium}
                  >
                    {isLoading && selectedPlanId === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
                      </>
                    ) : (
                      "Nâng cấp ngay"
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <FooterComponent />
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SubscriptionPageContent />
    </Suspense>
  );
}

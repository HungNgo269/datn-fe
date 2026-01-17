"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  createSubscriptionCheckout,
  cancelUserSubscription,
  getUserSubscription,
} from "@/app/feature/payments/api/payments.api";
import { useAuthStore } from "@/app/store/useAuthStore";
import Header from "../share/components/ui/header/header";
import FooterComponent from "../share/components/ui/footer/footer";
import { Check, X, Loader2, Crown, ShieldCheck, Zap } from "lucide-react";
import { UserSubscription } from "@/app/feature/payments/types/payment.type";
import { cn } from "@/lib/utils";

const RETURN_STORAGE_KEY = "payment:return";
const PAYMENT_TYPE_KEY = "payment:type";

function SubscriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isFetchingSub, setIsFetchingSub] = useState(true);

  const returnPath = useMemo(() => {
    const rawReturn = searchParams.get("return");
    if (rawReturn && rawReturn.startsWith("/")) {
      return rawReturn;
    }
    return "/books";
  }, [searchParams]);

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

  const handleCancelSubscription = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy gói hội viên? Bạn vẫn có thể truy cập cho đến hết chu kỳ hiện tại.")) return;
    
    setIsCanceling(true);
    try {
      await cancelUserSubscription();
      toast.success("Đã hủy gia hạn gói hội viên thành công.");
      // Refresh subscription state
      const sub = await getUserSubscription();
      setSubscription(sub);
    } catch (error) {
      toast.error("Không thể hủy gói hội viên. Vui lòng thử lại sau.");
    } finally {
      setIsCanceling(false);
    }
  };

  const isPremium = subscription?.status === "ACTIVE" || subscription?.status === "TRIALING";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="w-full max-w-[1200px] mx-auto">
          <Header />
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-12 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
        
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Nâng tầm trải nghiệm đọc của bạn
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Mở khóa kho sách bản quyền không giới hạn và tận hưởng các tính năng độc quyền dành riêng cho hội viên.
          </p>
        </div>

        {isFetchingSub ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="relative rounded-2xl bg-white border border-slate-200 p-8 shadow-sm flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Miễn phí</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">0₫</span>
                  <span className="ml-1 text-sm font-medium text-slate-500">/tháng</span>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Dành cho người mới bắt đầu khám phá NextBook.
                </p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-600">Đọc các chương miễn phí</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-600">Mua lẻ từng cuốn sách</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-slate-300 shrink-0" />
                  <span className="text-sm text-slate-400">Truy cập sách hội viên</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-slate-300 shrink-0" />
                  <span className="text-sm text-slate-400">Không quảng cáo</span>
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl font-medium border-slate-200"
                disabled={isPremium}
              >
                {isPremium ? "Đã bao gồm" : "Gói hiện tại"}
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="relative rounded-2xl bg-slate-900 text-white p-8 shadow-xl flex flex-col overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Crown size={120} />
              </div>
              
              <div className="mb-6 relative z-10">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  Premium
                  {isPremium && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider font-bold">
                      Đang kích hoạt
                    </span>
                  )}
                </h3>
                <div className="mt-4 flex items-baseline relative z-10">
                  <span className="text-4xl font-bold tracking-tight text-white">59.000₫</span>
                  <span className="ml-1 text-sm font-medium text-slate-400">/tháng</span>
                </div>
                <p className="mt-4 text-sm text-slate-400 relative z-10">
                  Trải nghiệm đọc sách đỉnh cao không giới hạn.
                </p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1 relative z-10">
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded ">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-sm text-slate-200">Truy cập toàn bộ sách hội viên</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded ">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-sm text-slate-200">Không giới hạn chương đọc</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded ">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-sm text-slate-200">Không quảng cáo làm phiền</span>
                </li>
                <li className="flex items-start gap-3">
                   <div className="p-1 rounded ">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-sm text-slate-200">Hỗ trợ tác giả yêu thích</span>
                </li>
              </ul>
              
              {isPremium ? (
                <div className="space-y-3 relative z-10">
                  <div className="p-3 rounded-lg bg-white/10 border border-white/10 text-xs text-slate-300">
                    <p>Gói cước gia hạn tự động.</p>
                    {subscription?.currentPeriodEnd && (
                      <p className="mt-1">
                        Hết hạn vào: <span className="text-white font-medium">
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
                      className="w-full h-12 rounded-xl font-medium bg-white/10 hover:bg-white/20 text-white border-0"
                      disabled={isCanceling}
                    >
                      {isCanceling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vui lòng chờ...
                        </>
                      ) : "Hủy gia hạn"}
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={handleSubscribe}
                  className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0 shadow-lg shadow-orange-500/20 relative z-10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang chuyển hướng...
                    </>
                  ) : "Nâng cấp ngay"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Feature Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Cập nhật nhanh nhất</h4>
            <p className="text-sm text-slate-500">Được đọc các chương mới sớm nhất ngay khi tác giả vừa xuất bản.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600">
              <Crown className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Đặc quyền hội viên</h4>
            <p className="text-sm text-slate-500">Huy hiệu hội viên độc quyền và màu tên nổi bật trong phần bình luận.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 text-purple-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Thanh toán an toàn</h4>
            <p className="text-sm text-slate-500">Cổng thanh toán bảo mật, hỗ trợ nhiều phương thức thẻ nội địa và quốc tế.</p>
          </div>
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

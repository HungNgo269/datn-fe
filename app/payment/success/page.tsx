"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/useAuthStore";
import Header from "@/app/share/components/ui/header/header";
import FooterComponent from "@/app/share/components/ui/footer/footer";
import { Check, PartyPopper, ArrowRight, Home, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const RETURN_STORAGE_KEY = "payment:return";
const PAYMENT_TYPE_KEY = "payment:type";
const PAYMENT_SUCCESS_KEY = "payment:success";
const DEFAULT_RETURN_PATH = "/books";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [returnPath, setReturnPath] = useState(DEFAULT_RETURN_PATH);
  const [isProcessed, setIsProcessed] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    // Generate transaction ID only on client to avoid hydration mismatch
    setTransactionId(Math.random().toString(36).substring(7).toUpperCase());

    if (isProcessed) return;

    let path = DEFAULT_RETURN_PATH;
    try {
      const stored = localStorage.getItem(RETURN_STORAGE_KEY);
      if (stored && stored.startsWith("/")) {
        path = stored;
      }
      
      // Do not remove RETURN_STORAGE_KEY here to prevent React Strict Mode 
      // from clearing it on the first of two mounts in dev.
      // It will be overwritten by the next payment action anyway.

      const paymentType = localStorage.getItem(PAYMENT_TYPE_KEY);
      if (paymentType === "subscription") {
        useAuthStore.getState().setSubscriptionPlan("PREMIUM");
      }
      
      // Determine if we should clear payment type? 
      // For safety, we can leave it or clear it. 
      // Clearing it might cause double-mount issues for the premium logic too 
      // if we relied on local state, but we rely on global store so it's safer.
      // But let's keep it simple and just leave keys or clear only type.
      localStorage.removeItem(PAYMENT_TYPE_KEY);
      localStorage.setItem(PAYMENT_SUCCESS_KEY, "1");
      
      setReturnPath(path);
      setIsProcessed(true);
      toast.success("Thanh toán thành công");
    } catch (e) {
      console.error("Error processing payment success:", e);
      setIsProcessed(true);
    }
  }, [isProcessed]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-emerald-100 selection:text-emerald-900">
       <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto">
          <Header />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 flex items-center justify-center py-24">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative group transition-all duration-300 hover:shadow-md">
          {/* Decorative background gradients */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
          
          <div className="p-10 text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 relative group-hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 rounded-full bg-emerald-100/50 animate-ping opacity-20" />
              <Check className="w-12 h-12 text-emerald-500 relative z-10" strokeWidth={2.5} />
              <div className="absolute -top-1 -right-1 bg-white p-2 rounded-full shadow-sm border border-emerald-50">
                <PartyPopper className="w-5 h-5 text-amber-500" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Thanh toán thành công!
            </h1>
            <p className="text-slate-600 mb-10 leading-relaxed text-lg">
              Cảm ơn bạn đã tin tưởng dịch vụ. <br/>Giao dịch đã được xác nhận.
            </p>

            <div className="space-y-4">
              <Button 
                asChild 
                className={cn(
                  "w-full h-14 rounded-2xl text-base font-semibold",
                  "bg-emerald-600 hover:bg-emerald-700 text-white",
                  "shadow-sm hover:shadow-emerald-500/20 transition-all duration-300",
                  "flex items-center justify-center gap-2"
                )}
              >
                <Link href={returnPath}>
                  Tiếp tục đọc sách <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                asChild
                className={cn(
                  "w-full h-14 rounded-2xl text-base font-medium",
                  "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                  "transition-colors duration-200"
                )}
              >
                <Link href="/books">
                  <Home className="mr-2 w-5 h-5" /> Về trang chủ
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-50/50 p-5 text-center border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
            <Receipt className="w-4 h-4" />
            <p className="text-sm font-medium font-mono tracking-wide">
              Mã GD: {transactionId || "..."}
            </p>
          </div>
        </div>
      </main>

      <FooterComponent />
    </div>
  );
}

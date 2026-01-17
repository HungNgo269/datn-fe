"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/share/components/ui/header/header";
import FooterComponent from "@/app/share/components/ui/footer/footer";
import { XCircle, RefreshCw, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const RETURN_STORAGE_KEY = "payment:return";
const PAYMENT_TYPE_KEY = "payment:type";
const DEFAULT_RETURN_PATH = "/books";

export default function PaymentCancelPage() {
  const router = useRouter();
  const [returnPath, setReturnPath] = useState(DEFAULT_RETURN_PATH);

  useEffect(() => {
    let path = DEFAULT_RETURN_PATH;
    try {
      const stored = localStorage.getItem(RETURN_STORAGE_KEY);
      if (stored && stored.startsWith("/")) {
        path = stored;
      }
      
      // Do not remove RETURN_STORAGE_KEY here to prevent React Strict Mode 
      // from clearing it on the first of two mounts in dev.
      localStorage.removeItem(PAYMENT_TYPE_KEY);
      
      setReturnPath(path);
    } catch (e) {
      console.error("Error processing payment cancel:", e);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-red-100 selection:text-red-900">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto">
          <Header />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 flex items-center justify-center py-24">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative group transition-all duration-300 hover:shadow-md">
          {/* Decorative background gradients */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-400 to-pink-500" />
          
          <div className="p-10 text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 relative group-hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 rounded-full bg-red-100/50 animate-ping opacity-20" />
              <XCircle className="w-12 h-12 text-red-500 relative z-10" strokeWidth={2.5} />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Thanh toán thất bại
            </h1>
            <p className="text-slate-600 mb-10 leading-relaxed text-lg">
              Giao dịch đã bị hủy hoặc gặp lỗi trong quá trình xử lý. <br/>Tài khoản của bạn chưa bị trừ tiền.
            </p>

            <div className="space-y-4">
              <Button 
                asChild 
                className={cn(
                  "w-full h-14 rounded-2xl text-base font-semibold",
                  "bg-slate-900 hover:bg-slate-800 text-white",
                  "shadow-sm hover:shadow-slate-900/10 transition-all duration-300",
                  "flex items-center justify-center gap-2"
                )}
              >
                <Link href={returnPath}>
                  <RefreshCw className="w-5 h-5" /> Thử lại
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
             <AlertCircle className="w-4 h-4" />
             <p className="text-sm font-medium">
              Cần hỗ trợ? Liên hệ CSKH
            </p>
          </div>
        </div>
      </main>

      <FooterComponent />
    </div>
  );
}

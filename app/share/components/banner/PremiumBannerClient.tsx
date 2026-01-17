"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/useAuthStore";
import { LoginRequiredDialog } from "@/app/share/components/ui/dialog/LoginRequiredDialog";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface BannerData {
  id: number;
  title?: string | null;
  description?: string | null;
  imageUrl: string;
  linkUrl: string;
}

interface PremiumBannerClientProps {
  className?: string;
  bannerData?: BannerData | null;
}

export function PremiumBannerClient({ className, bannerData }: PremiumBannerClientProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore((state) => state);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Case-insensitive check
  const isPremium = isAuthenticated && user?.subscriptionPlan?.toUpperCase() === "PREMIUM";

  const handleUpgrade = useCallback(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
    } else {
      router.push("/subscription");
    }
  }, [isAuthenticated, router]);

  // If Premium AND we have valid banner data, show the Image Banner
  if (isPremium && bannerData) {
    return (
      <Link
        href={`/${bannerData.linkUrl}`}
        className={cn("relative block w-full aspect-[16/10] lg:h-[207px] hover:cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all", className)}
      >
        <Image
          fill
          className="object-cover"
          src={bannerData.imageUrl}
          alt={bannerData.description || "Banner"}
        />
      </Link>
    );
  }

  // Fallback: Show "Upgrade to Premium" Banner
  return (
    <>
      <div className={cn(
        "p-6 bg-white rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md",
        className
      )}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
            <Crown className="h-4 w-4 text-amber-500 fill-current" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-amber-600">
            NextBook Premium
          </span>
        </div>
        
        <h3 className="text-xl font-bold leading-tight mb-3 text-slate-900 font-serif">
          Trải nghiệm đọc không giới hạn.
        </h3>
        
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Mở khóa hàng ngàn tựa sách độc quyền và tính năng cao cấp ngay hôm nay.
        </p>
        
        <button 
          onClick={handleUpgrade}
          className="w-full py-3 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-[0.98] cursor-pointer"
        >
          Nâng cấp ngay
        </button>
      </div>

      <LoginRequiredDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
        title="Đăng ký hội viên"
        description="Bạn cần đăng nhập để xem các gói hội viên và nâng cấp tài khoản."
      />
    </>
  );
}

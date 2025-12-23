"use client";

import { useState } from "react";
import BannerContent from "./bannerContent";
import BannerControls from "./bannerController";
import { useQuery } from "@tanstack/react-query";
import { getAllBanners } from "../api/banner.api";
import { Loader2 } from "lucide-react";

export default function BannerComponent() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["banner"],
    queryFn: () => getAllBanners(),
    placeholderData: (previousData) => previousData,
  });
  const handleBannerChange = (newBanner: number) => {
    setIsTransitioning(true);
    setCurrentBanner(newBanner);
    setTimeout(() => setIsTransitioning(false), 300);
  };
  const banners = data?.data;
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-destructive text-center">
        Không thể tải dữ liệu
      </div>
    );
  }
  return (
    <div className="relative w-full mx-auto bg-white shadow-lg overflow-hidden">
      <BannerContent banners={banners!} currentBanner={currentBanner} />
      <BannerControls
        totalBanners={10}
        currentBanner={currentBanner}
        onBannerChange={handleBannerChange}
        isTransitioning={isTransitioning}
      />
    </div>
  );
}

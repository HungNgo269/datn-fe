"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BannerContent from "./bannerContent";
import BannerControls from "./bannerController";
import { Banner } from "../types/banner.types";

interface BannerHomeSliderClientProps {
  banners: Banner[];
  total?: number;
}

export default function BannerHomeSliderClient({
  banners,
  total,
}: BannerHomeSliderClientProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleBannerChange = useCallback((nextIndex: number) => {
    setIsTransitioning(true);
    setCurrentBanner(nextIndex);
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, []);

  const totalBanners = total ?? banners.length;

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  if (!banners.length) {
    return null;
  }

  return (
    <div className="relative w-full mx-auto bg-white shadow-lg overflow-hidden">
      <BannerContent banners={banners} currentBanner={currentBanner} />
      <BannerControls
        totalBanners={totalBanners}
        currentBanner={currentBanner}
        onBannerChange={handleBannerChange}
        isTransitioning={isTransitioning}
      />
    </div>
  );
}

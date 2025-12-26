"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerControlsProps {
  totalBanners: number;
  currentBanner: number;
  onBannerChange: (index: number) => void;
  isTransitioning: boolean;
}

export default function BannerControls({
  totalBanners,
  currentBanner,
  onBannerChange,
  isTransitioning,
}: BannerControlsProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  const nextBanner = useCallback(() => {
    if (isTransitioning) return;
    onBannerChange((currentBanner + 1) % totalBanners);
  }, [currentBanner, totalBanners, isTransitioning, onBannerChange]);

  const prevBanner = useCallback(() => {
    if (isTransitioning) return;
    onBannerChange((currentBanner - 1 + totalBanners) % totalBanners);
  }, [currentBanner, totalBanners, isTransitioning, onBannerChange]);

  const goToBanner = (index: number) => {
    if (isTransitioning || index === currentBanner) return;
    onBannerChange(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      nextBanner();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, nextBanner]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-24 bottom-10 bg-background/90 hover:bg-background border-border text-primary shadow-lg z-30 rounded-[50%] cursor-pointer"
        onClick={prevBanner}
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Previous banner</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 bottom-10 bg-background/90 hover:bg-background border-border text-primary shadow-lg z-30 rounded-[50%] cursor-pointer"
        onClick={nextBanner}
      >
        <ChevronRight className="h-5 w-5" />
        <span className="sr-only">Next banner</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-10 right-14 bg-background/90 hover:bg-background border-border text-primary shadow-lg z-30 rounded-[50%] cursor-pointer"
        onClick={togglePlayPause}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        <span className="sr-only">{isPlaying ? "Pause" : "Play"} Banner</span>
      </Button>

      <div className="flex justify-center items-center space-x-2 py-4 bg-transparent absolute z-10 bottom-0 left-0 right-0">
        {Array.from({ length: totalBanners }, (_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all cursor-pointer duration-200 ${
              index === currentBanner
                ? "bg-primary scale-110"
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => goToBanner(index)}
            disabled={isTransitioning}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
}

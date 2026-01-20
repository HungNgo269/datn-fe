"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
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

  const goToBanner = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentBanner) return;
      onBannerChange(index);
    },
    [currentBanner, isTransitioning, onBannerChange]
  );

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

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
        className="absolute bottom-10 right-24 z-20 cursor-pointer rounded-[50%] border-border bg-background/90 text-primary shadow-lg hover:bg-background"
        onClick={prevBanner}
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Previous banner</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-10 right-4 z-20 cursor-pointer rounded-[50%] border-border bg-background/90 text-primary shadow-lg hover:bg-background"
        onClick={nextBanner}
      >
        <ChevronRight className="h-5 w-5" />
        <span className="sr-only">Next banner</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-10 right-14 z-20 cursor-pointer rounded-[50%] border-border bg-background/90 text-primary shadow-lg hover:bg-background"
        onClick={togglePlayPause}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="sr-only">{isPlaying ? "Pause" : "Play"} Banner</span>
      </Button>

      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center space-x-2 bg-transparent py-4">
        {Array.from({ length: totalBanners }, (_, index) => (
          <button
            key={index}
            className={`h-3 w-3 cursor-pointer rounded-full transition-all duration-200 ${
              index === currentBanner
                ? "scale-110 bg-primary"
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

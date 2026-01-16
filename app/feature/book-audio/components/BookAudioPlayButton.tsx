"use client";

import { useCallback } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookAudioStore } from "@/app/store/useBookAudioStore";
import { cn } from "@/lib/utils";

interface BookAudioPlayButtonProps {
  bookSlug: string;
  bookTitle: string;
  coverImage: string;
  className?: string;
}

export function BookAudioPlayButton({
  bookSlug,
  bookTitle,
  coverImage,
  className,
}: BookAudioPlayButtonProps) {
  const currentTrackId = useBookAudioStore(
    (state) => state.currentTrack?.id ?? null
  );
  const isPlaying = useBookAudioStore((state) => state.isPlaying);
  const startDemoTrack = useBookAudioStore((state) => state.startDemoTrack);
  const stopTrack = useBookAudioStore((state) => state.stopTrack);
  const resumeTrack = useBookAudioStore((state) => state.resumeTrack);

  const isCurrentTrack = currentTrackId === bookSlug;
  const active = isCurrentTrack && isPlaying;

  const handleClick = useCallback(() => {
    if (isCurrentTrack && isPlaying) {
      stopTrack();
      return;
    }

    if (isCurrentTrack && !isPlaying) {
      resumeTrack();
      return;
    }

    startDemoTrack({
      id: bookSlug,
      title: bookTitle,
      episode: "Demo chapter preview",
      coverImage,
    });
  }, [bookSlug, bookTitle, coverImage, isCurrentTrack, isPlaying, resumeTrack, startDemoTrack, stopTrack]);

  return (
    <Button
      type="button"
      variant="default"
      onClick={handleClick}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90",
        active && "ring-2 ring-primary/60 ring-offset-2",
        className
      )}
      aria-label={active ? "Dừng audio minh họa" : "Phát audio minh họa"}
      title={active ? "Dừng audio" : "Phát audio"}
    >
      {active ? (
        <Square className="h-5 w-5 fill-current" />
      ) : (
        <Play className="h-5 w-5 translate-x-0.5 fill-current" />
      )}
    </Button>
  );
}

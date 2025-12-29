"use client";

import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookAudioStore } from "@/app/store/useBookAudioStore";
import { cn } from "@/lib/utils";

interface BookAudioPlayButtonProps {
  bookSlug: string;
  bookTitle: string;
  className?: string;
}

export function BookAudioPlayButton({
  bookSlug,
  bookTitle,
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

  const handleClick = () => {
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
    });
  };

  return (
    <Button
      type="button"
      variant="default"
      onClick={handleClick}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 shadow-sm",
        active && "ring-2 ring-offset-2 ring-primary/60",
        className
      )}
      aria-label={active ? "Dừng audio minh họa" : "Phát audio minh họa"}
      title={active ? "Dừng audio" : "Phát audio"}
    >
      {active ? (
        <Square className="h-5 w-5 fill-current" />
      ) : (
        <Play className="h-5 w-5 fill-current translate-x-0.5" />
      )}
    </Button>
  );
}

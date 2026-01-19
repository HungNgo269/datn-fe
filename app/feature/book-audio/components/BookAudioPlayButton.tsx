"use client";

import { useCallback } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useBookAudioStore,
  MOCK_CHAPTERS,
  type AudioChapter,
} from "@/app/store/useBookAudioStore";
import { cn } from "@/lib/utils";

interface BookAudioPlayButtonProps {
  bookSlug: string;
  bookTitle: string;
  coverImage: string;
  chapters?: AudioChapter[];
  accessType?: string;
  isPurchased?: boolean;
  isSubscribed?: boolean;
  className?: string;
}

export function BookAudioPlayButton({
  bookSlug,
  bookTitle,
  coverImage,
  chapters,
  accessType,
  isPurchased,
  isSubscribed,
  className,
}: BookAudioPlayButtonProps) {
  const currentTrackId = useBookAudioStore(
    (state) => state.currentTrack?.id ?? null
  );
  const isPlaying = useBookAudioStore((state) => state.isPlaying);
  const startPlayback = useBookAudioStore((state) => state.startPlayback);
  const stopTrack = useBookAudioStore((state) => state.stopTrack);
  const resumeTrack = useBookAudioStore((state) => state.resumeTrack);

  const isCurrentTrack = currentTrackId === bookSlug;
  const active = isCurrentTrack && isPlaying;

  // Use provided chapters or empty array
  const bookChapters = chapters ?? [];

  const handleClick = useCallback(() => {
    if (isCurrentTrack && isPlaying) {
      stopTrack();
      return;
    }

    if (isCurrentTrack && !isPlaying) {
      resumeTrack();
      return;
    }

    // Chapters already have duration in milliseconds (converted from API seconds)
    // No need for fallback, duration will be updated when audio loads
    const chaptersWithDuration = bookChapters;

    // Default to index 0
    let startIndex = 0;

    // If not purchased or subscribed, find the first free chapter
    // Note: isSubscribed here implies active subscription that covers this book
    const hasFullAccess = isPurchased || (isSubscribed && accessType === 'membership');
    
    if (!hasFullAccess) {
        const firstFreeIndex = chaptersWithDuration.findIndex(c => c.isFree);
        if (firstFreeIndex !== -1) {
            startIndex = firstFreeIndex;
        }
    }

    // Start playing
    startPlayback(
      {
        id: bookSlug,
        title: bookTitle,
        coverImage,
        chapters: chaptersWithDuration,
        accessType,
        isPurchased,
        isSubscribed,
      },
      startIndex
    );
  }, [
    bookSlug,
    bookTitle,
    coverImage,
    bookChapters,
    isCurrentTrack,
    isPlaying,
    resumeTrack,
    startPlayback,
    stopTrack,
    accessType,
    isPurchased,
    isSubscribed,
  ]);

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

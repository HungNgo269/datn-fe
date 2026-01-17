"use client";

import { useCallback } from "react";
import { Play, Pause, X, LockOpenIcon } from "lucide-react";
import { useBookAudioStore } from "@/app/store/useBookAudioStore";
import { cn } from "@/lib/utils";

interface BookAudioChapterListProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookAudioChapterList({
  isOpen,
  onClose,
}: BookAudioChapterListProps) {
  const currentTrack = useBookAudioStore((state) => state.currentTrack);
  const currentChapterIndex = useBookAudioStore(
    (state) => state.currentChapterIndex
  );
  const isPlaying = useBookAudioStore((state) => state.isPlaying);
  const playChapter = useBookAudioStore((state) => state.playChapter);
  const pauseTrack = useBookAudioStore((state) => state.pauseTrack);
  const resumeTrack = useBookAudioStore((state) => state.resumeTrack);

  const formatDuration = (durationMs: number): string => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleChapterClick = useCallback(
    (index: number) => {
      if (index === currentChapterIndex) {
        // Toggle play/pause for current chapter
        if (isPlaying) {
          pauseTrack();
        } else {
          resumeTrack();
        }
      } else {
        // Play different chapter
        playChapter(index);
      }
    },
    [currentChapterIndex, isPlaying, pauseTrack, playChapter, resumeTrack]
  );

  const totalChapters = currentTrack?.chapters.length ?? 0;

  if (!isOpen || !currentTrack) {
    return null;
  }

  return (
    <>
      {/* Chapter List Panel */}
      <div className="fixed right-4 bottom-[90px] sm:bottom-[96px] xl:bottom-[100px] z-40 flex h-[500px] max-h-[70vh] w-[320px] sm:w-[400px] lg:w-[420px] flex-col rounded-xl border border-border/50 bg-card/95 backdrop-blur-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">
            Danh sách phát ({totalChapters})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close chapter list"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto">
          {currentTrack.chapters.map((chapter, index) => {
            const isCurrentChapter = index === currentChapterIndex;
            const isChapterPlaying = isCurrentChapter && isPlaying;

            return (
              <div
                key={chapter.id}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                  isCurrentChapter && "bg-primary/5"
                )}
              >
                {/* Chapter Number */}
                <span
                  className={cn(
                    "w-5 text-center text-sm tabular-nums",
                    isCurrentChapter ? "text-primary font-medium" : "text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>

                {/* Chapter Info */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      isCurrentChapter ? "text-primary" : "text-foreground"
                    )}
                  >
                    {chapter.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {chapter.date && <span>{chapter.date}</span>}
                  </div>
                </div>

                {/* Duration */}
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatDuration(chapter.duration)}
                </span>

                {/* Access Badge */}
                {(() => {
                  const isFree = chapter.isFree ?? false;
                  const isPurchased = currentTrack.isPurchased ?? false;
                  const isSubscribed = currentTrack.isSubscribed ?? false;
                  const accessType = currentTrack.accessType;
                  
                  const isUnlocked = isFree || isPurchased || (isSubscribed && accessType === 'membership');

                  if (isFree) {
                    return (
                        <span className="rounded px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                            Miễn phí
                        </span>
                    );
                  }

                  if (isUnlocked) {
                      return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full w-[40px] text-muted-foreground">
                              <LockOpenIcon className="w-3.5 h-3.5" />
                          </span>
                      )
                  }

                   if (accessType === 'membership') {
                    return (
                      <span className="rounded px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                        Hội viên
                      </span>
                    );
                  }
                  
                  return (
                    <span className="rounded px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-700">
                      Mua sách
                    </span>
                  );
                })()}

                {/* Play Button */}
                <button
                  type="button"
                  onClick={() => handleChapterClick(index)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                    isCurrentChapter
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground opacity-0 group-hover:opacity-100"
                  )}
                  aria-label={
                    isChapterPlaying
                      ? `Pause ${chapter.title}`
                      : `Play ${chapter.title}`
                  }
                >
                  {isChapterPlaying ? (
                    <Pause className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Play className="h-3.5 w-3.5 translate-x-[1px] fill-current" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

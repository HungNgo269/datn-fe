"use client";

import { useCallback, useMemo } from "react";
import { Play, Pause, X, LockOpenIcon, Lock } from "lucide-react";
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

  // Filter chapters to only show those with audio (duration > 0)
  const chaptersWithAudio = useMemo(() => {
    if (!currentTrack?.chapters) return [];
    
    // Filter and map to keep original indices
    return currentTrack.chapters
      .map((chapter, originalIndex) => ({ chapter, originalIndex }));
  }, [currentTrack?.chapters]);

  const totalChapters = chaptersWithAudio.length;

  const handleChapterClick = useCallback(
    (originalIndex: number) => {
      if (originalIndex === currentChapterIndex) {
        // Toggle play/pause for current chapter
        if (isPlaying) {
          pauseTrack();
        } else {
          resumeTrack();
        }
      } else {
        // Play different chapter
        playChapter(originalIndex);
      }
    },
    [currentChapterIndex, isPlaying, pauseTrack, playChapter, resumeTrack]
  );

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
          {chaptersWithAudio.map(({ chapter, originalIndex }, displayIndex) => {
            const isCurrentChapter = originalIndex === currentChapterIndex;
            // Determine access status
            const isFree = chapter.isFree ?? false;
            const accessType = currentTrack.accessType;
            const isPurchased = currentTrack.isPurchased ?? false;
            const isSubscribed = currentTrack.isSubscribed ?? false;
            
            const isUnlocked = isFree || isPurchased || (isSubscribed && accessType === 'membership');
            const isLocked = !isUnlocked;
            const isChapterPlaying = isCurrentChapter && isPlaying;

            return (
              <div
                key={chapter.id}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 transition-colors border-b border-border/40 last:border-0",
                  isCurrentChapter ? "bg-primary/5" : "hover:bg-muted/50",
                  isLocked && "opacity-60 bg-slate-50"
                )}
              >
                {/* Chapter Number */}
                <span
                  className={cn(
                    "w-6 text-center text-xs sm:text-sm tabular-nums shrink-0",
                    isCurrentChapter ? "text-primary font-bold" : "text-muted-foreground"
                  )}
                >
                  {displayIndex + 1}
                </span>

                {/* Chapter Info */}
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <p
                    className={cn(
                      "truncate text-sm font-medium leading-tight",
                      isCurrentChapter ? "text-primary" : "text-foreground"
                    )}
                  >
                    {chapter.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mt-1">
                     <span className="tabular-nums">{formatDuration(chapter.duration)}</span>
                     {chapter.date && (
                         <>
                            <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                            <span>{chapter.date}</span>
                         </>
                     )}
                  </div>
                </div>

                {/* Access Badge - Only show if strictly necessary or for explicit status */}
                <div className="shrink-0">
                    {(() => {
                        if (isFree) {
                            return (
                                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-secondary text-secondary-foreground border border-border">
                                    Miễn phí
                                </span>
                            );
                        }

                        if (isUnlocked) {
                            // If unlocked but not free (purchased/member), maybe show nothing or a small icon?
                            // Let's keep it clean
                             return null;
                        }

                        if (accessType === 'membership') {
                             return (
                                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                                    Hội viên <Lock className="w-2.5 h-2.5" />
                                </span>
                            );
                        }
                        
                        return (
                             <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1">
                                Mua <Lock className="w-2.5 h-2.5" />
                             </span>
                        );
                    })()}
                </div>

                {/* Play Button */}
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && handleChapterClick(originalIndex)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all shrink-0",
                    isCurrentChapter
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                    isLocked && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground"
                  )}
                  aria-label={
                    isChapterPlaying
                      ? `Pause ${chapter.title}`
                      : `Play ${chapter.title}`
                  }
                >
                  {isChapterPlaying ? (
                    <Pause className="h-3.5 w-3.5 fill-current" />
                  ) : isLocked ? (
                     <Lock className="h-3.5 w-3.5" />
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

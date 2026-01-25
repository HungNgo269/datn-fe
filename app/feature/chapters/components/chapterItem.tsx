import Link from "next/link";
import { formatDateTimeUTC } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { ChapterCardProps } from "../types/chapter.type";
import {
  Lock,
  LockOpenIcon,
  Play,
  Pause,
} from "lucide-react";
import { useBookAudioStore } from "@/app/store/useBookAudioStore";

interface ChapterItemProps {
  chapter: ChapterCardProps;
  basePath: string;
  freeChapters?: number;
  accessType?: string;
  isAuthenticated?: boolean;
  onRequireLogin?: (
    type: "membership" | "purchase",
    chapter: ChapterCardProps
  ) => void;
  isPurchased?: boolean;
  isSubscribed?: boolean;
  bookTitle?: string;
  bookCoverImage?: string;
  bookSlug?: string;
  allChapters?: ChapterCardProps[];
}

function AccessBadge({
  isFree,
  accessType,
  isUnlocked,
}: {
  isFree: boolean;
  accessType?: string;
  isUnlocked?: boolean;
}) {
  return (
    <div className="flex items-center justify-center w-[100px] shrink-0">
      {isFree ? (
        <span className="text-sm font-medium text-primary">Miễn phí</span>
      ) : isUnlocked ? (
        <LockOpenIcon className="w-4 h-4 text-slate-400" />
      ) : (
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium",
            accessType === "membership" ? "text-amber-600" : "text-rose-600"
          )}
        >
          <span className="hidden sm:inline">
            {accessType === "membership" ? "Hội viên" : "Mua sách"}
          </span>
          <Lock className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export function ChapterItem({
  chapter,
  basePath,
  freeChapters = 0,
  accessType,
  isAuthenticated = false,
  onRequireLogin,
  isPurchased,
  isSubscribed,
  bookTitle,
  bookCoverImage,
  bookSlug,
  allChapters,
}: ChapterItemProps) {
  const isFree = chapter.order <= freeChapters;
  // Check if the entire book is free (accessType = "FREE" means all chapters are free)
  const isBookFree = accessType?.toUpperCase() === "FREE";
  const isUnlocked =
    isBookFree || // All chapters unlocked for free books
    isFree || 
    isPurchased || 
    (isSubscribed && accessType === "membership");
  const isLocked = !isUnlocked;

  // Optimized Selectors: Only subscribe to primitive values to avoid re-renders on object reference changes
  const currentTrackId = useBookAudioStore((state) => state.currentTrack?.id);
  const activeChapterId = useBookAudioStore(
    (state) => state.currentTrack?.chapters?.[state.currentChapterIndex]?.id
  );
  const isPlaying = useBookAudioStore((state) => state.isPlaying);
  const isLoading = useBookAudioStore((state) => state.isLoading);
  
  // Get actions individually to avoid creating new object references on every render
  const startPlayback = useBookAudioStore((state) => state.startPlayback);
  const playChapter = useBookAudioStore((state) => state.playChapter);
  const pauseTrack = useBookAudioStore((state) => state.pauseTrack);
  const resumeTrack = useBookAudioStore((state) => state.resumeTrack);

  const chapterIdStr = chapter.id.toString();
  const isCurrentBook = currentTrackId === bookSlug;
  const isCurrentChapter = isCurrentBook && activeChapterId === chapterIdStr;
  const isChapterPlaying = isCurrentChapter && isPlaying;

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLocked) return;
    if (!bookSlug || !bookTitle || !bookCoverImage) return;

    if (isCurrentChapter) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
      return;
    }

    // Access fresh state directly to avoid subscribing to the entire track object during render
    const state = useBookAudioStore.getState();
    const currentTrack = state.currentTrack;

    // If playing the same book, try to switch chapter directly
    if (isCurrentBook && currentTrack?.chapters) {
      const playingTrackIndex = currentTrack.chapters.findIndex(
        (c) => c.id === chapterIdStr
      );

      if (playingTrackIndex !== -1) {
        playChapter(playingTrackIndex);
        return;
      }
    }

    // For TTS support, we allow all chapters to be played
    // Filter to ensure we have valid chapter data, but don't strictly require pre-existing audio
    const validAudioChapters = allChapters || []; // Use all available chapters

    const chaptersToPlay =
      validAudioChapters.length > 0
        ? validAudioChapters.map((c) => ({
            id: c.id.toString(),
            title: c.title,
            // Convert duration from seconds to milliseconds (API returns seconds)
            duration: c.audio?.duration && c.audio.duration > 0 ? c.audio.duration * 1000 : 0,
            isFree: c.order <= freeChapters,
          }))
        : [
            {
              id: chapterIdStr,
              title: chapter.title,
              // Convert duration from seconds to milliseconds (API returns seconds)
              duration: chapter.audio?.duration && chapter.audio.duration > 0 ? chapter.audio.duration * 1000 : 0,
              isFree: isFree,
            },
          ];

    const targetIndex =
        validAudioChapters.length > 0
            ? validAudioChapters.findIndex((c) => c.id === chapter.id)
            : 0;

    startPlayback(
      {
        id: bookSlug,
        title: bookTitle,
        coverImage: bookCoverImage,
        chapters: chaptersToPlay,
        accessType: accessType,
        isPurchased: isPurchased,
        isSubscribed: isSubscribed,
      },
      Math.max(0, targetIndex)
    );
  };

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between rounded-xl px-4 py-4 transition-all duration-200",
        "hover:bg-slate-50 border-b border-slate-100 last:border-b-0",
        chapter.is_viewed && "bg-slate-50/50"
      )}
    >
      <div className="flex-1 min-w-0 pr-4">
        <Link
          href={!isLocked ? `${basePath}/chapter/${chapter.slug}` : "#"}
          onClick={(e) => {
            if (isLocked) {
                e.preventDefault();
                onRequireLogin?.(
                    accessType === "membership" ? "membership" : "purchase",
                    chapter
                );
            }
          }}
          className={cn(
            "line-clamp-1 text-sm transition-colors font-medium",
            chapter.is_viewed ? "text-muted-foreground" : "text-foreground",
            isLocked && "text-muted-foreground/80"
          )}
        >
          {chapter.title}
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <AccessBadge
          isFree={isFree}
          accessType={accessType}
          isUnlocked={isUnlocked}
        />

        <div className="flex justify-center w-[40px]">
          {true ? (
            <button
              onClick={handlePlayAudio}
              disabled={isLocked || (isCurrentChapter && isLoading)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all border",
                isChapterPlaying
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-primary border-slate-200 hover:border-primary",
                isLocked && "opacity-0 pointer-events-none"
              )}
            >
              {isCurrentChapter && isLoading ? (
                 <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isChapterPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current translate-x-[0.5px]" />
              )}
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        <div className="hidden md:flex justify-end w-[80px]">
          <span className="text-xs text-muted-foreground/60 tabular-nums">
            {formatDateTimeUTC(chapter.createdAt).split(" ")[0]}
          </span>
        </div>
      </div>
    </div>
  );
}


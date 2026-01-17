import Link from "next/link";
import { formatDateTimeUTC } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { ChapterCardProps } from "../types/chapter.type";
import {
  BookOpen,
  Crown,
  ShoppingBag,
  Gift,
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
}

// Access badge component
function AccessBadge({
  isFree,
  accessType,
  isUnlocked,
}: {
  isFree: boolean;
  accessType?: string;
  isUnlocked?: boolean;
}) {
  if (isFree) {
    return (
      <span
        className="inline-flex items-center 
      gap-1 px-2 py-0.5 rounded-full text-md font-medium 
      text-primary "
      >
        Miễn phí
      </span>
    );
  }

  if (isUnlocked) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full w-[60px] ">
        <LockOpenIcon className="w-4 h-4" />
      </span>
    );
  }

  if (accessType === "membership") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-md font-medium text-amber-600">
        Hội viên
      </span>
    );
  }

  // Default: purchase required
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-md font-medium text-rose-600">
      Mua sách
    </span>
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
}: ChapterItemProps) {
  const isFree = chapter.order <= freeChapters;

  // Determine if chapter is unlocked for this user
  const isUnlocked =
    isFree || isPurchased || (isSubscribed && accessType === "membership");
  const isLocked = !isUnlocked; // Simplified logic: if not unlocked, it is locked.

  // Audio Store
  const currentTrackId = useBookAudioStore(
    (state) => state.currentTrack?.id ?? null
  );
  const currentChapterIndex = useBookAudioStore(
    (state) => state.currentChapterIndex
  );
  const isPlaying = useBookAudioStore((state) => state.isPlaying);
  const startPlayback = useBookAudioStore((state) => state.startPlayback);
  const playChapter = useBookAudioStore((state) => state.playChapter);
  const pauseTrack = useBookAudioStore((state) => state.pauseTrack);
  const resumeTrack = useBookAudioStore((state) => state.resumeTrack);

  // Check if this specific chapter is currently playing
  // Note: We need to match both the book (via slug/id) AND the chapter index
  // Currently useBookAudioStore tracks chapters by index in the array given to it.
  // Assuming 'chapter.order' corresponds to the index (0-based) or we need to find its index.
  // If chapter.order is 1-based, we convert to 0-based: index = order - 1
  const chapterIndex = chapter.order - 1;
  const isCurrentBook = currentTrackId === bookSlug; // Assuming bookSlug is the track ID
  const isCurrentChapter = isCurrentBook && currentChapterIndex === chapterIndex;
  const isChapterPlaying = isCurrentChapter && isPlaying;

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!bookSlug || !bookTitle || !bookCoverImage) return;

    if (isCurrentChapter) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else if (isCurrentBook) {
        playChapter(chapterIndex);
    } else {
        // Start new book playback
        // NOTE: Ideally we should pass ALL chapters to startPlayback so the user can navigate.
        // Passing just this one chapter might limit navigation.
        // However, fetching all chapters here might be redundant if the store can't handle it easily?
        // Actually, startPlayback expects a track with chapters.
        // If we want FULL navigation, we need the parent to pass all chapters to this item (expensive) or the store to fetch them.
        // For now, let's create a single-chapter track or partial track.
        // BETTER APPROACH: The user is on the Book Detail page. We know the full chapter list is available in the parent.
        // But `ChapterItem` only knows about `chapter`.
        // If we want the "next" button to work, we need the full list.
        // As a compromise/start, we can't fully support "Next" if we launch from here without full data.
        // BUT, since we are on the page, maybe we DO have full data in the store if the user clicked the main play button?
        // If not, we might launch with just this chapter.
        
        startPlayback({
             id: bookSlug,
             title: bookTitle,
             coverImage: bookCoverImage,
             chapters: [{
                 id: chapter.id.toString(),
                 title: chapter.title,
                 duration: chapter.audio?.duration ?? 0,
                 isFree: isFree
             }]
        }, 0);
    }
  };


  const handleClick = (e: React.MouseEvent) => {
    // If chapter is locked, prevent navigation
    if (isLocked) {
      e.preventDefault();
      if (onRequireLogin) {
        if (accessType === "membership") {
          onRequireLogin("membership", chapter);
        } else {
          onRequireLogin("purchase", chapter);
        }
      }
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200",
        "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent",
        "border-b border-slate-100 last:border-b-0",
        chapter.is_viewed && "bg-slate-50/50"
      )}
    >
      {/* Chapter content */}
      <div className="flex flex-1 min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Link
            prefetch={false}
            href={!isLocked ? `${basePath}/chapter/${chapter.slug}` : "#"}
            onClick={handleClick}
            className={cn(
              "flex-1 truncate text-sm transition-colors",
              chapter.is_viewed
                ? "text-muted-foreground"
                : "text-foreground font-medium hover:text-primary",
              isLocked && "opacity-80"
            )}
          >
            <span>{chapter.title}</span>
          </Link>

          {/* Lock icon for locked chapters */}
          {isLocked && (
            <Lock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          )}
        </div>

        {/* Date - shown on mobile */}
        <span className="text-[10px] text-muted-foreground/70 sm:hidden">
          {formatDateTimeUTC(chapter.createdAt)}
        </span>
      </div>

      {/* Right side: Badge + Date + Audio Button */}
      <div className="flex items-center gap-3 ml-3 sm:w-[240px] justify-end">
        <AccessBadge
          isFree={isFree}
          accessType={accessType}
          isUnlocked={isUnlocked}
        />
        
        {/* Audio Button - Only show if chapter has audio */}
        {chapter.audio && (
             <button
                onClick={handlePlayAudio}
                className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all border",
                    isChapterPlaying 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-white text-primary border-slate-200 hover:border-primary hover:bg-primary/5"
                )}
                title={isChapterPlaying ? "Dừng phát" : "Phát audio chương này"}
             >
                {isChapterPlaying ? (
                    <Pause className="h-3.5 w-3.5 fill-current" />
                ) : (
                    <Play className="h-3.5 w-3.5 fill-current translate-x-[1px]" />
                )}
             </button>
        )}

        {/* Date - hidden on mobile */}
        <span className="hidden sm:inline-block flex-shrink-0 text-xs text-muted-foreground/70 min-w-[80px] text-right">
          {formatDateTimeUTC(chapter.createdAt)}
        </span>
      </div>
    </div>
  );
}


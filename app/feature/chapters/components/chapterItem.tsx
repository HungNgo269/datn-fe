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
  allChapters?: ChapterCardProps[]; // Add this prop to receive full list
}

// Access badge component
function AccessBadge({
  isFree,
  accessType,
  isUnlocked,
  isLocked,
}: {
  isFree: boolean;
  accessType?: string;
  isUnlocked?: boolean;
  isLocked?: boolean;
}) {
  return (
    // Quan trọng: w-[100px] và justify-center giúp mọi thứ luôn thẳng trục giữa
    <div className="flex items-center justify-center w-[100px] shrink-0">
      {isFree ? (
        <span className="text-sm font-medium text-primary">
          Miễn phí
        </span>
      ) : isUnlocked ? (
        <LockOpenIcon className="w-4 h-4 text-slate-400" />
      ) : (
        <div className={cn(
          "flex items-center gap-1.5 text-sm font-medium",
          accessType === "membership" ? "text-amber-600" : "text-rose-600"
        )}>
          {/* Chỉ hiện text trên màn hình lớn nếu muốn, hoặc để nguyên để đồng nhất */}
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

  // Determine if chapter is unlocked for this user
  const isUnlocked =
    isFree || isPurchased || (isSubscribed && accessType === "membership");
  const isLocked = !isUnlocked; // Simplified logic: if not unlocked, it is locked.

  // Audio Store
  const currentTrack = useBookAudioStore((state) => state.currentTrack); // Need full track to get chapter IDs
  const currentTrackId = currentTrack?.id ?? null;
  const currentChapterIndex = useBookAudioStore(
    (state) => state.currentChapterIndex
  );
  const isPlaying = useBookAudioStore((state) => state.isPlaying);
  const startPlayback = useBookAudioStore((state) => state.startPlayback);
  const playChapter = useBookAudioStore((state) => state.playChapter);
  const pauseTrack = useBookAudioStore((state) => state.pauseTrack);
  const resumeTrack = useBookAudioStore((state) => state.resumeTrack);

  // Check if this specific chapter is currently playing
  // FIX: Use ID-based comparison for accuracy, as the playlist might be a filtered subset of allChapters
  const activeChapterId = currentTrack?.chapters?.[currentChapterIndex]?.id;
  const chapterIdStr = chapter.id.toString();
  
  const isCurrentBook = currentTrackId === bookSlug;
  const isCurrentChapter = isCurrentBook && activeChapterId === chapterIdStr;
  const isChapterPlaying = isCurrentChapter && isPlaying;

    // Find index in the FULL list if available, otherwise fallback to local logic
  const chapterIndex = (function() {
      if (allChapters && allChapters.length > 0) {
          return allChapters.findIndex(c => c.id === chapter.id);
      }
      return chapter.order - 1; 
  })();

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
    } else if (isCurrentBook) {
        // Fix: Find index in CURRENT TRACK's chapters list (filtered), not global list
        const playingTrackIndex = currentTrack?.chapters?.findIndex(c => c.id === chapter.id.toString());
        
        if (playingTrackIndex !== undefined && playingTrackIndex !== -1) {
             playChapter(playingTrackIndex);
        } else {
             // If not found in current playlist (rare, but possible if context differs), restart playback logic
             // Recalculate everything as if it's a new playback
             const validAudioChapters = (allChapters && allChapters.length > 0)
                ? allChapters.filter(c => c.audio || c.hasAudio)
                : [];

             const chaptersToPlay = (validAudioChapters.length > 0) 
                ? validAudioChapters.map(c => ({
                    id: c.id.toString(),
                    title: c.title,
                    duration: (c.audio?.duration && c.audio.duration > 0) ? c.audio.duration : 600000,
                    isFree: c.order <= freeChapters
                }))
                : [{
                     id: chapter.id.toString(),
                     title: chapter.title,
                     duration: (chapter.audio?.duration && chapter.audio.duration > 0) ? chapter.audio.duration : 600000,
                     isFree: isFree
                 }];

             const targetChapterId = chapter.id;
             const startIndexInPlaylist = (validAudioChapters.length > 0)
                  ? validAudioChapters.findIndex(c => c.id === targetChapterId)
                  : 0;
             const finalStartIndex = startIndexInPlaylist >= 0 ? startIndexInPlaylist : 0;

             startPlayback({
                  id: bookSlug,
                  title: bookTitle,
                  coverImage: bookCoverImage,
                  chapters: chaptersToPlay,
                  accessType: accessType,
                  isPurchased: isPurchased,
                  isSubscribed: isSubscribed
             }, finalStartIndex);
        }
    } else {
        // Check if we have the full chapter list to create a proper playlist
        // Filter to only chapters that HAVE audio, otherwise we get 0-duration items that are filtered out or shouldn't be played
        const validAudioChapters = (allChapters && allChapters.length > 0)
            ? allChapters.filter(c => c.audio || c.hasAudio)
            : [];

        const chaptersToPlay = (validAudioChapters.length > 0) 
            ? validAudioChapters.map(c => ({
                id: c.id.toString(),
                title: c.title,
                // FIX: If duration is 0/missing, default to 10 mins (600000) so it shows in the list
                duration: (c.audio?.duration && c.audio.duration > 0) ? c.audio.duration : 600000,
                isFree: c.order <= freeChapters
            }))
            : [{
                 id: chapter.id.toString(),
                 title: chapter.title,
                 duration: (chapter.audio?.duration && chapter.audio.duration > 0) ? chapter.audio.duration : 600000,
                 isFree: isFree
             }];

        // Find the correct start index in the FILTERED list
        // If we filtered out some chapters (non-audio), the index will shift.
        const targetChapterId = chapter.id;
        const startIndexInPlaylist = (validAudioChapters.length > 0)
             ? validAudioChapters.findIndex(c => c.id === targetChapterId)
             : 0;
             
        // Safety check: if for some reason the current chapter was filtered out (e.g. hasAudio is false but we are here?), fallback to 0
        const finalStartIndex = startIndexInPlaylist >= 0 ? startIndexInPlaylist : 0;

        startPlayback({
             id: bookSlug,
             title: bookTitle,
             coverImage: bookCoverImage,
             chapters: chaptersToPlay,
             accessType: accessType,
             isPurchased: isPurchased,
             isSubscribed: isSubscribed
        }, finalStartIndex);
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
      "group relative flex items-center justify-between rounded-xl px-4 py-4 transition-all duration-200",
      "hover:bg-slate-50 border-b border-slate-100 last:border-b-0",
      chapter.is_viewed && "bg-slate-50/50"
    )}
  >
    {/* Bên trái: Tiêu đề chương */}
    <div className="flex-1 min-w-0 pr-4">
      <Link
        href={!isLocked ? `${basePath}/chapter/${chapter.slug}` : "#"}
        className={cn(
          "line-clamp-1 text-sm transition-colors font-medium",
          chapter.is_viewed ? "text-muted-foreground" : "text-foreground",
          isLocked && "text-muted-foreground/80"
        )}
      >
        {chapter.title}
      </Link>
    </div>

    {/* Bên phải: Cụm chức năng được cố định trục dọc */}
    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
      
      {/* Cột 1: Badge Trạng thái - Đã fix width 100px ở component trên */}
      <AccessBadge
        isFree={isFree}
        accessType={accessType}
        isUnlocked={isUnlocked}
        isLocked={isLocked}
      />

      {/* Cột 2: Nút Audio - Fix width 40px để icon Play luôn thẳng hàng */}
      <div className="flex justify-center w-[40px]">
        {(chapter.audio || chapter.hasAudio) ? (
          <button
            onClick={handlePlayAudio}
            disabled={isLocked}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all border",
              isChapterPlaying 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-white text-primary border-slate-200 hover:border-primary",
              isLocked && "opacity-0 pointer-events-none" // Ẩn nút nếu bị khóa để đỡ rối, hoặc để opacity thấp
            )}
          >
            {isChapterPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current translate-x-[0.5px]" />
            )}
          </button>
        ) : (
          <div className="w-8" /> 
        )}
      </div>

      {/* Cột 3: Ngày tháng - Fix width để lề phải luôn thẳng */}
      <div className="hidden md:flex justify-end w-[80px]">
        <span className="text-xs text-muted-foreground/60 tabular-nums">
          {formatDateTimeUTC(chapter.createdAt).split(' ')[0]}
        </span>
      </div>
    </div>
  </div>
);
}


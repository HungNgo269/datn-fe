import Link from "next/link";
import { formatDateTimeUTC } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { ChapterCardProps } from "../types/chapter.type";
import { BookOpen, Crown, ShoppingBag, Gift, Lock, LockOpenIcon } from "lucide-react";

interface ChapterItemProps {
  chapter: ChapterCardProps;
  basePath: string;
  freeChapters?: number;
  accessType?: string;
  isAuthenticated?: boolean;
  onRequireLogin?: (type: "membership" | "purchase", chapter: ChapterCardProps) => void;
  isPurchased?: boolean;
  isSubscribed?: boolean;
}

// Access badge component
function AccessBadge({ 
  isFree, 
  accessType,
  isUnlocked
}: { 
  isFree: boolean; 
  accessType?: string;
  isUnlocked?: boolean;
}) {
  if (isFree) {
    return (
      <span className="inline-flex items-center 
      gap-1 px-2 py-0.5 rounded-full text-md font-medium 
      text-primary ">
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
  
  if (accessType === 'membership') {
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
  isSubscribed
}: ChapterItemProps) {
  const isFree = chapter.order <= freeChapters;
  
  // Determine if chapter is unlocked for this user
  const isUnlocked = isFree || isPurchased || (isSubscribed && accessType === 'membership');
  const isLocked = !isUnlocked; // Simplified logic: if not unlocked, it is locked.
  
  const handleClick = (e: React.MouseEvent) => {
    // If chapter is locked, prevent navigation
    if (isLocked) {
      e.preventDefault();
      if (onRequireLogin) {
         if (accessType === 'membership') {
            onRequireLogin('membership', chapter);
         } else {
            onRequireLogin('purchase', chapter);
         }
      }
    }
  };
  
  return (
    <div className={cn(
      "group relative flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200",
      "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent",
      "border-b border-slate-100 last:border-b-0",
      chapter.is_viewed && "bg-slate-50/50"
    )}>
      {/* Chapter content */}
      <div className="flex flex-1 min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Link
            prefetch={false}
            href={!isLocked ? `${basePath}/chapter/${chapter.slug}` : '#'}
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
      
      {/* Right side: Badge + Date */}
      <div className="flex items-center gap-3 ml-3 w-[200px]">
        <AccessBadge isFree={isFree} accessType={accessType} isUnlocked={isUnlocked} />
        {/* Date - hidden on mobile */}
        <span className="hidden sm:inline-block flex-shrink-0 text-xs text-muted-foreground/70 min-w-[80px] text-right">
          {formatDateTimeUTC(chapter.createdAt)}
        </span>
      </div>
    </div>
  );
}


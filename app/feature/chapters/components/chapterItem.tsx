import Link from "next/link";
import { formatDateTimeUTC } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { ChapterCardProps } from "../types/chapter.type";

interface ChapterItemProps {
  chapter: ChapterCardProps;
  basePath: string;
}

export function ChapterItem({ chapter, basePath }: ChapterItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md px-4 py-4 transition-colors hover:bg-card group">
      <div className="flex flex-1 min-w-0 flex-row items-center gap-2">
        <Link
          prefetch={false}
          href={`${basePath}/chapter/${chapter.slug}`}
          className={cn(
            "flex-1 truncate text-md hover:text-primary",
            chapter.is_viewed ? "text-foreground/60" : "text-foreground font-medium"
          )}
        >
          <span className="mr-2">{chapter.title}</span>
        </Link>
      </div>
      <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">
        {formatDateTimeUTC(chapter.createdAt)}
      </span>
    </div>
  );
}

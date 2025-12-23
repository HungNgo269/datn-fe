import Link from "next/link";
import { formatDateTimeUTC } from "@/lib/formatDate";
import { ChapterCardProps } from "../types/chapter.type";

interface ChapterItemProps {
  chapter: ChapterCardProps;
  basePath: string;
}

export function ChapterItem({ chapter, basePath }: ChapterItemProps) {
  return (
    <div className="flex items-center justify-between group rounded-md bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-4 transition-colors">
      <div className="flex flex-row items-center gap-2 min-w-0 flex-1">
        <Link
          prefetch={true}
          href={`${basePath}/chapter/${chapter.slug}`}
          className={`${
            chapter.is_viewed
              ? "text-foreground/60"
              : "text-primary font-medium"
          } text-md hover:text-primary/80 truncate flex-1`}
        >
          <span className="mr-2">
            Chương {chapter.order}: {chapter.title}
          </span>
        </Link>
      </div>
      <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">
        {formatDateTimeUTC(chapter.createdAt)}
      </span>
    </div>
  );
}

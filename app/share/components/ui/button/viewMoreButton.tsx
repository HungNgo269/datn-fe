import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ViewMoreButtonProps {
  url: string;
  context: "chapter" | "book";
}

const LABELS: Record<ViewMoreButtonProps["context"] | "book", string> = {
  chapter: "Xem thêm chương",
  book: "Xem thêm sách",
};

export default function ViewMoreButton({
  url,
  context = "book",
}: ViewMoreButtonProps) {
  const label = LABELS[context] ?? LABELS.book;

  return (
    <Link prefetch={true} href={url} className="ml-auto">
      <button className="flex items-center text-foreground hover:text-primary transition-colors cursor-pointer text-sm font-medium">
        <span className="mr-1 w-fit">{label}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </Link>
  );
}

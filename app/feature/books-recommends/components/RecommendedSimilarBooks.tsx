import { Separator } from "@/components/ui/separator";
import { getRecommendedSimilarBooks } from "../actions/recommendBooks.action";
import RecommendedSimilarBookContent from "./recommendSimilarBookContent";

interface RecommendBookProps {
  bookId: number;
  limit: number;
  title?: string;
}

export default async function RecommendedSimilarBooks({
  bookId,
  limit,
  title = "Những người đọc tác phẩm này cũng thích",
}: RecommendBookProps) {
  try {
    const books = await getRecommendedSimilarBooks(bookId, limit);
    if (!books?.length) {
      return <></>;
    }

    return (
      <div>
        <div className="flex flex-row gap-3 md:flex-col mt-19">
          <span className="font-bold text-lg text-start  line-clamp-2">
            {title}
          </span>
        </div>
        <Separator />

        <div className="space-y-3 mt-2">
          <RecommendedSimilarBookContent books={books} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load recommendations:", error);
    return (
      <div className="p-6 text-center text-destructive">
        Không thể tải danh sách đề xuất.
      </div>
    );
  }
}

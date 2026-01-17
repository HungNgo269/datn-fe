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
  title = "Những người đọc tác phẩm này cũng thích",
}: RecommendBookProps) {
  try {
    const books = await getRecommendedSimilarBooks(bookId, limit);
    if (!books?.length) {
      return null;
    }

    return (
      <div>
        
        <div className="mt-19 flex flex-row gap-3 md:flex-col">
            <div className="flex flex-row items-center gap-2">

              <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/20 rounded-full">
          
                         </div>
          <span className="line-clamp-2 text-start text-lg font-bold">
            {title}
          </span>
            </div>
        </div>
        <Separator />

        <div className="mt-2 space-y-3">
          <RecommendedSimilarBookContent books={books} />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="p-6 text-center text-destructive">
        Không thể tải danh sách đề xuất.
      </div>
    );
  }
}

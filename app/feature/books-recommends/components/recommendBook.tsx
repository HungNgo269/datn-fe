import { Separator } from "@/components/ui/separator";
import { getRecommendedBooksAction } from "../actions/recommendBooks.action";
import RecommendBookContent from "./recommendBookContent";

interface RecommendBookProps {
  limit?: number;
  title?: string;
}

export default async function RecommendBook({
  limit = 10,
  title = "Những đầu truyện được gợi ý thêm",
}: RecommendBookProps) {
  try {
    const books = await getRecommendedBooksAction(limit);

    if (!books?.length) {
      return (
        <div className="flex flex-col gap-2">
          <span className="font-bold text-lg text-start line-clamp-2">
            {title}
          </span>
          <Separator />
          <div className="text-sm text-muted-foreground">
            Chưa có gợi ý nào để hiển thị.
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex flex-row gap-3 md:flex-col ">
          <span className="font-bold text-lg text-start  line-clamp-2">
            {title}
          </span>
        </div>
        <Separator />

        <div className="space-y-3 mt-2">
          <RecommendBookContent books={books} />
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


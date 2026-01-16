import { Separator } from "@/components/ui/separator";
import { getPopularBooksAction } from "../actions/popularBooks.action";
import PopularBookContent from "./popularBookContent";

interface PopularBookProps {
  limit?: number;
  title?: string;
}

export default async function PopularBook({
  limit = 5,
  title = "Những cuốn sách được xem nhiều nhất",
}: PopularBookProps) {
  try {
    const books = await getPopularBooksAction(limit);

    if (!books?.length) {
      return (
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold">{title}</span>
          <Separator />
          <div className="text-sm text-muted-foreground">
            Chưa có dữ liệu sách phổ biến.
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="mt-10 flex flex-row gap-3 md:flex-col">
          <span className="whitespace-nowrap text-start text-lg font-bold">
            {title}
          </span>
        </div>
        <Separator />
        <div className="mt-2 space-y-3">
          <PopularBookContent books={books} />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="p-6 text-center text-destructive">
        Không thể tải danh sách sách phổ biến.
      </div>
    );
  }
}

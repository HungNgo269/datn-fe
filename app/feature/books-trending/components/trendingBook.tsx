import { Separator } from "@/components/ui/separator";
import {
  DEFAULT_TIMEFRAME,
  TimeFrame,
  normalizeTimeFrame,
} from "@/lib/timeCount";
import TrendingBookFilter from "./trendingBookFilter";
import TrendingBookContent from "./tredingBookContent";
import { getTrendingBooksAction } from "../actions/trendingBooks.action";

interface TrendingBookProps {
  period?: TimeFrame | string | string[];
  limit?: number;
  title?: string;
  searchParamKey?: string;
}

export default async function TrendingBook({
  period = DEFAULT_TIMEFRAME,
  limit = 5,
  title = "Xu hướng",
  searchParamKey = "trendingPeriod",
}: TrendingBookProps) {
  const normalizedPeriod = normalizeTimeFrame(period, DEFAULT_TIMEFRAME);

  try {
    const books = await getTrendingBooksAction({
      period: normalizedPeriod,
      limit,
    });

    if (!books?.length) {
      return (
        <div className="flex flex-col gap-2 mt-5">
          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <span className="font-bold text-lg text-start whitespace-nowrap">
              {title}
            </span>
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground mt-2">
            Chưa có dữ liệu xu hướng.
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 mt-5">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
          <span className="font-bold text-lg text-start whitespace-nowrap">
            {title}
          </span>
          <TrendingBookFilter
            value={normalizedPeriod}
            paramKey={searchParamKey}
          />
        </div>
        <Separator />
        <div className="space-y-3 mt-2">
          <TrendingBookContent books={books} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load trending books:", error);
    return (
      <div className="p-6 text-center text-destructive">
        Không thể tải danh sách xu hướng.
      </div>
    );
  }
}


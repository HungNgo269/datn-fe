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
  limit = 10,
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
        <div className="flex flex-col gap-2 ">
          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <span className="whitespace-nowrap text-start text-lg font-bold">
              {title}
            </span>
          </div>
          <Separator />
          <div className="mt-2 text-sm text-muted-foreground">
            Chưa có dữ liệu xu hướng.
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
          <span className="whitespace-nowrap text-start text-lg font-bold">
            {title}
          </span>
          <TrendingBookFilter
            value={normalizedPeriod}
            paramKey={searchParamKey}
          />
        </div>
        <Separator />
        <div className="mt-2 space-y-3">
          <TrendingBookContent books={books} />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="p-6 text-center text-destructive">
        Không thể tải danh sách xu hướng.
      </div>
    );
  }
}

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { format } from "date-fns"; // Cần cài date-fns để format ngày
import {
  RatingDistributionDto,
  RatingScore,
  RatingWithUserResponseDto,
} from "../../ratings/types/rating.type";
import {
  getBookRatings,
  getBookRatingSummary,
  getMyRatingForBook,
} from "../../ratings/api/ratings.api";
import { RatingForm } from "../../ratings/components/RatingForm";
import { useAuthStore } from "@/app/store/useAuthStore";

interface ChapterRatingProps {
  bookId: number;
}

export function ChapterRating({ bookId }: ChapterRatingProps) {
  const currentUser = useAuthStore((state) => state.user);
  // 1. Fetch Summary (Cache 1 tiếng)
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["rating-summary", bookId],
    queryFn: () => getBookRatingSummary(bookId),
    staleTime: 60 * 60 * 1000, // 1 giờ
  });

  // 2. Fetch My Rating (Để biết user đã rate chưa)
  const { data: myRating } = useQuery({
    queryKey: ["my-rating", bookId],
    queryFn: () => getMyRatingForBook({ bookId }),
    retry: false, // Nếu 401 unauth thì thôi không retry
  });

  // 3. Fetch List Ratings (Pagination đơn giản trang 1)
  const { data: ratingsList, isLoading: isLoadingList } = useQuery({
    queryKey: ["book-ratings", bookId],
    queryFn: () => getBookRatings(bookId, { page: 1, limit: 10 }),
    staleTime: 60 * 60 * 1000,
  });

  const hasRated = Boolean(myRating?.id);
  const normalizedUserId = myRating?.userId ?? currentUser?.id ?? null;
  const orderedReviews = useMemo(() => {
    const list = ratingsList?.data ?? [];
    if (!normalizedUserId) {
      return list;
    }
    const highlight = list.find((review) => review.userId === normalizedUserId);
    if (highlight) {
      const rest = list.filter((review) => review.id !== highlight.id);
      return [highlight, ...rest];
    }
    if (myRating && currentUser) {
      const syntheticReview: RatingWithUserResponseDto = {
        ...myRating,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
        },
      };
      return [syntheticReview, ...list];
    }
    return list;
  }, [currentUser, myRating, normalizedUserId, ratingsList?.data]);

  if (isLoadingSummary) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Handle distribution data an toàn
  const emptyDistribution: RatingDistributionDto = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const distribution = summary?.distribution ?? emptyDistribution;
  const totalReviews = summary?.ratingCount || 0;
  const averageRating = summary?.averageRating || 0;
  return (
    <div className="space-y-8 py-4">
      {/* --- PHẦN THỐNG KÊ --- */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-muted/20 p-6 rounded-xl">
        <div className="text-center space-y-2 min-w-[200px]">
          <div className="text-5xl font-bold text-primary">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex text-yellow-400 justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i <= Math.round(averageRating)
                    ? "fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            dựa trên {totalReviews} đánh giá
          </p>

          {/* Nút Rate/Edit */}
          <div className="pt-2">
            <RatingForm
              bookId={bookId}
              // Nếu chưa rate thì truyền score mặc định là 5, review rỗng
              initialData={
                hasRated
                  ? { score: myRating?.score, review: myRating?.review }
                  : { score: 5, review: "" }
              }
              isEdit={!!hasRated} // Dùng biến hasRated đã check kỹ ở trên
            />
          </div>
        </div>

        {/* --- PHẦN PROGRESS BARS --- */}
        <div className="flex-1 w-full space-y-2">
          {([5, 4, 3, 2, 1] as RatingScore[]).map((star) => {
            const count = distribution[star] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 font-medium">{star}</span>
                <Star className="w-3 h-3 text-muted-foreground" />
                <Progress value={percent} className="h-2 flex-1" />
                <span className="w-10 text-right text-muted-foreground text-xs">
                  {percent.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- PHẦN LIST ĐÁNH GIÁ --- */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Đánh giá gần đây</h3>

        {isLoadingList ? (
          <div className="text-center py-4 text-muted-foreground">
            Đang tải bình luận...
          </div>
        ) : orderedReviews && orderedReviews.length > 0 ? (
          orderedReviews.map((review: RatingWithUserResponseDto) => {
            const isCurrentUserReview =
              normalizedUserId !== null && review.userId === normalizedUserId;

            return (
              <div
                key={review.id}
                className={cn(
                  "border-b border-border pb-4 last:border-0 rounded-md",
                  isCurrentUserReview && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {review.user?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {review.user?.username || ""}
                        </div>
                        {isCurrentUserReview && (
                          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                            Your rating
                          </span>
                        )}
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.score
                                ? "fill-current"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {review.createdAt
                      ? format(new Date(review.createdAt), "dd/MM/yyyy")
                      : ""}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 mt-2">
                  {review.review}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa có đánh giá nào.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/app/store/useAuthStore";
import { formatTimeVN } from "@/lib/formatDate";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { useMemo } from "react";
import {
  getBookRatingStats,
  getBookRatings,
  getBookRatingSummary,
} from "../../ratings/api/ratings.api";
import { RatingForm } from "../../ratings/components/RatingForm";
import {
  RatingDistributionDto,
  RatingScore,
  RatingWithUserResponseDto,
} from "../../ratings/types/rating.type";

interface ChapterRatingProps {
  bookId: number;
}

const EMPTY_DISTRIBUTION: RatingDistributionDto = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};
const RATING_STARS = [1, 2, 3, 4, 5];
const DISTRIBUTION_STARS = [5, 4, 3, 2, 1] as RatingScore[];

export function ChapterRating({ bookId }: ChapterRatingProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["rating-summary", bookId],
    queryFn: () => getBookRatingSummary(bookId),
    staleTime: 60 * 60 * 1000, // 1 giờ
  });

  const { data: ratingStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["rating-stats", bookId],
    queryFn: () => getBookRatingStats(bookId),
  });

  const { data: ratingsList, isLoading: isLoadingList } = useQuery({
    queryKey: ["book-ratings", bookId],
    queryFn: () => getBookRatings(bookId),
    staleTime: 60 * 60 * 1000,
  });

  const userRating = ratingStats?.userRating ?? null;
  const hasRated = Boolean(userRating?.id);
  const normalizedUserId = userRating?.userId ?? currentUser?.id ?? null;

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
    if (userRating && currentUser) {
      const syntheticReview: RatingWithUserResponseDto = {
        ...userRating,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
        },
      };
      return [syntheticReview, ...list];
    }
    return list;
  }, [currentUser, normalizedUserId, ratingsList?.data, userRating]);

  if (isLoadingSummary || isLoadingStats) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const distribution = summary?.distribution ?? EMPTY_DISTRIBUTION;
  const totalReviews = ratingStats?.ratingCount ?? summary?.ratingCount ?? 0;
  const averageRating =
    ratingStats?.averageRating ?? summary?.averageRating ?? 0;

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col items-center gap-8 rounded-sm border shadow-xs p-6 md:flex-row md:items-start">
        <div className="min-w-[200px] space-y-2 text-center">
          <div className="text-5xl font-bold text-primary">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center gap-1 text-yellow-400">
            {RATING_STARS.map((i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i <= Math.round(averageRating)
                    ? "fill-current"
                    : "text-gray-300",
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Dựa trên {totalReviews} đánh giá
          </p>

          <div className="pt-2">
            <RatingForm
              bookId={bookId}
              initialData={
                hasRated
                  ? {
                      score: userRating?.score ?? 5,
                      review: userRating?.review ?? "",
                    }
                  : { score: 5, review: "" }
              }
              isEdit={hasRated}
            />
          </div>
        </div>

        <div className="w-full flex-1 space-y-2">
          {DISTRIBUTION_STARS.map((star) => {
            const count = distribution[star] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 font-medium">{star}</span>
                <Star className="h-3 w-3 text-muted-foreground" />
                <Progress value={percent} className="h-2 flex-1" />
                <span className="w-10 text-right text-xs text-muted-foreground">
                  {percent.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Đánh giá gần đây</h3>

        {isLoadingList ? (
          <div className="py-4 text-center text-muted-foreground">
            Đang tải bình luận...
          </div>
        ) : orderedReviews && orderedReviews.length > 0 ? (
          orderedReviews.map((review: RatingWithUserResponseDto) => {
            const formattedReviewTime = review.createdAt
              ? formatTimeVN(review.createdAt)
              : null;

            return (
              <div
                key={review.id}
                className="border-b border-border pb-4 last:border-0"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {review.user?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-medium">
                          {review.user?.username || ""}
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < review.score ? "fill-current" : "text-gray-200",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {formattedReviewTime && (
                    <span
                      className="text-xs text-muted-foreground"
                      title={formattedReviewTime.fullDateTime}
                      suppressHydrationWarning
                    >
                      {formattedReviewTime.label}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-foreground/80">
                  {review.review}
                </p>
              </div>
            );
          })
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Chưa có đánh giá nào.
          </p>
        )}
      </div>
    </div>
  );
}

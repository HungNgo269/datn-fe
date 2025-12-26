"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

const MOCK_RATINGS = [
  {
    id: 1,
    user: "Độc giả 1",
    rating: 5,
    content: "Siêu phẩm!",
    date: "10/10/2024",
  },
  {
    id: 2,
    user: "Độc giả 2",
    rating: 4,
    content: "Cốt truyện ổn, dịch mượt.",
    date: "09/10/2024",
  },
];

export function ChapterRating() {
  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-muted/20 p-6 rounded-xl">
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-primary">4.8</div>
          <div className="flex text-warning justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            dựa trên 1,234 đánh giá
          </p>
        </div>

        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3">{star}</span>
              <Star className="w-3 h-3 text-muted-foreground" />
              <Progress
                value={star === 5 ? 70 : star === 4 ? 20 : 5}
                className="h-2"
              />
              <span className="w-10 text-right text-muted-foreground">
                {star === 5 ? "70%" : "..."}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Đánh giá gần đây</h3>
        {MOCK_RATINGS.map((review) => (
          <div
            key={review.id}
            className="border-b border-border pb-4 last:border-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback>{review.user[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{review.user}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {review.date}
              </span>
            </div>
            <div className="flex text-warning mb-2">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <p className="text-sm text-foreground/80">{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

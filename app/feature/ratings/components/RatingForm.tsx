"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Hoặc library toast bạn dùng
import { createBookRating, updateBookRating } from "../api/ratings.api";

interface RatingFormProps {
  bookId: number;
  initialData?: { score: number; review?: string };
  isEdit?: boolean;
}

export function RatingForm({
  bookId,
  initialData,
  isEdit = false,
}: RatingFormProps) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(initialData?.score || 5);
  const [review, setReview] = useState(initialData?.review || "");
  const [hoverScore, setHoverScore] = useState(0);
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScore(initialData.score || 5);
      setReview(initialData.review || "");
    } else {
      setScore(5);
      setReview("");
    }
  }, [initialData]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { score, review };
      if (isEdit) return updateBookRating(bookId, payload);
      return createBookRating(bookId, payload);
    },
    onSuccess: () => {
      toast.success(
        isEdit ? "Cập nhật đánh giá thành công" : "Đánh giá thành công"
      );
      queryClient.invalidateQueries({ queryKey: ["rating-summary", bookId] });
      queryClient.invalidateQueries({ queryKey: ["my-rating", bookId] });
      queryClient.invalidateQueries({ queryKey: ["book-ratings", bookId] });
      setOpen(false);
    },
    onError: () => {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    },
  });

  const handleSubmit = () => {
    if (score === 0) {
      toast.error("Vui lòng chọn số sao");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEdit ? "outline" : "default"}>
          {isEdit ? "Sửa đánh giá" : "Viết đánh giá"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật đánh giá" : "Đánh giá sách"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                onClick={() => setScore(star)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverScore || score)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center font-medium text-sm text-muted-foreground">
            {hoverScore || score} / 5
          </div>
          <Textarea
            placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

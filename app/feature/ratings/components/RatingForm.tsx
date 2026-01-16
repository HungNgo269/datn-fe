"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  createBookRating,
  deleteBookRating,
  updateBookRating,
} from "../api/ratings.api";

interface RatingFormProps {
  bookId: number;
  initialData?: { score: number; review?: string };
  isEdit?: boolean;
}

const STAR_VALUES = [1, 2, 3, 4, 5];

export function RatingForm({
  bookId,
  initialData,
  isEdit = false,
}: RatingFormProps) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(() => initialData?.score ?? 5);
  const [review, setReview] = useState(() => initialData?.review ?? "");
  const [hoverScore, setHoverScore] = useState(0);

  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const saveMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["rating-stats", bookId] });
      queryClient.invalidateQueries({ queryKey: ["book-ratings", bookId] });
      setOpen(false);
    },
    onError: () => {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBookRating(bookId),
    onSuccess: () => {
      toast.success("Xóa đánh giá thành công");
      queryClient.invalidateQueries({ queryKey: ["rating-summary", bookId] });
      queryClient.invalidateQueries({ queryKey: ["rating-stats", bookId] });
      queryClient.invalidateQueries({ queryKey: ["book-ratings", bookId] });
      setScore(5);
      setReview("");
      setOpen(false);
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa đánh giá");
    },
  });

  const handleSubmit = useCallback(() => {
    if (score === 0) {
      toast.error("Vui lòng chọn số sao");
      return;
    }
    saveMutation.mutate();
  }, [saveMutation, score]);

  const handleDelete = useCallback(() => {
    if (!isEdit) return;
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa đánh giá của mình cho sách này?"
      )
    ) {
      return;
    }
    deleteMutation.mutate();
  }, [deleteMutation, isEdit]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && !isAuthenticated) {
        const callbackUrl = encodeURIComponent(pathname || "/");
        router.push(`/login?callbackUrl=${callbackUrl}`);
        return;
      }
      if (nextOpen) {
        setScore(initialData?.score ?? 5);
        setReview(initialData?.review ?? "");
      }
      setOpen(nextOpen);
    },
    [initialData?.review, initialData?.score, isAuthenticated, pathname, router]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            {STAR_VALUES.map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                onClick={() => setScore(star)}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverScore || score)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center text-sm font-medium text-muted-foreground">
            {hoverScore || score} / 5
          </div>
          <Textarea
            placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa đánh giá"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

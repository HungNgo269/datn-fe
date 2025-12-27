"use client";

import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/handleApiRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addBookToFavorites,
  getFavoriteStatus,
  removeBookFromFavorites,
} from "../api/favorites.api";
import { FavoriteStatusResponseDto } from "../types/favorite.type";
import { useAuthStore } from "@/app/store/useAuthStore";

interface FavoriteButtonProps {
  bookId: number;
  userId?: number | null;
  className?: string;
}

export function FavoriteButton({
  bookId,
  userId,
  className,
}: FavoriteButtonProps) {
  const storeUserId = useAuthStore((state) => state.user?.id);
  const effectiveUserId = userId ?? storeUserId ?? undefined;
  const queryClient = useQueryClient();

  const {
    data: favoriteStatus,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["favorite-status", bookId],
    queryFn: async () => {
      try {
        return await getFavoriteStatus(bookId);
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 401) {
          return null;
        }
        throw err;
      }
    },
    enabled: Boolean(bookId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isFavorited = favoriteStatus?.isFavorited ?? false;
  const totalFavorites = favoriteStatus?.totalFavorites ?? 0;

  const mutation = useMutation({
    mutationFn: async (currentlyFavorited: boolean) => {
      if (!effectiveUserId) {
        throw new Error("UNAUTHENTICATED");
      }

      if (currentlyFavorited) {
        await removeBookFromFavorites(bookId);
        return false;
      }

      await addBookToFavorites(bookId);
      return true;
    },
    onMutate: async (currentlyFavorited) => {
      await queryClient.cancelQueries({
        queryKey: ["favorite-status", bookId],
      });

      const previous =
        queryClient.getQueryData<FavoriteStatusResponseDto | null>([
          "favorite-status",
          bookId,
        ]) ?? {
          isFavorited: false,
          totalFavorites: 0,
        };

      const nextState: FavoriteStatusResponseDto = {
        isFavorited: !currentlyFavorited,
        totalFavorites: Math.max(
          0,
          previous.totalFavorites + (currentlyFavorited ? -1 : 1)
        ),
      };

      queryClient.setQueryData(["favorite-status", bookId], nextState);

      return { previous, nextState };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["favorite-status", bookId], context.previous);
      }

      if (error instanceof Error && error.message === "UNAUTHENTICATED") {
        toast.error("Vui lòng đăng nhập để thêm sách vào danh sách yêu thích.");
        return;
      }

      toast.error("Không thể cập nhật trạng thái yêu thích. Thử lại sau.");
    },
    onSuccess: (_data, _variables, context) => {
      if (!context?.nextState) return;

      toast.success(
        context.nextState.isFavorited
          ? "Đã thêm vào danh sách yêu thích."
          : "Đã bỏ khỏi danh sách yêu thích."
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-status", bookId] });
    },
  });

  const isProcessing = mutation.isPending || isLoading || isFetching;

  const formattedTotal = new Intl.NumberFormat("vi-VN").format(totalFavorites);

  const handleClick = () => {
    if (!bookId) return;

    if (!effectiveUserId) {
      toast.info("Vui lòng đăng nhập để sử dụng tính năng yêu thích.");
      return;
    }

    mutation.mutate(isFavorited);
  };

  return (
    <Button
      type="button"
      variant={isFavorited ? "default" : "outline"}
      onClick={handleClick}
      disabled={isProcessing}
      className={cn(
        "h-full text-base px-6 w-full rounded-sm border border-border flex items-center justify-center gap-2 font-semibold",
        isFavorited && "bg-primary text-primary-foreground border-primary",
        className
      )}
    >
      {isProcessing ? (
        <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "mr-1.5 h-5 w-5",
            isFavorited ? "fill-current" : "text-primary"
          )}
        />
      )}
      <span className="flex flex-row leading-none text-left justify-center items-center gap-4 text-lg font-semibold">
        <span className="text-lg font-semibold">{formattedTotal}</span>
        {isFavorited ? "Đã yêu thích" : "Lượt yêu thích"}
      </span>
    </Button>
  );
}

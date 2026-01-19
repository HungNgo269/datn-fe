"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/handleApiRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addBookToFavorites,
  getFavoriteCount,
  getFavoriteStatus,
  removeBookFromFavorites,
} from "../api/favorites.api";
import { useAuthStore } from "@/app/store/useAuthStore";
import { FavoriteStatusResponseDto, FavoriteCountResponseDto } from "../types/favorite.type";
import { LoginRequiredDialog } from "@/app/share/components/ui/dialog/LoginRequiredDialog";

interface FavoriteButtonProps {
  bookId: number;
  userId?: number | null;
  className?: string;
}

function FavoriteButtonContent({
  bookId,
  userId,
  className,
}: FavoriteButtonProps) {
  const storeUserId = useAuthStore((state) => state.user?.id);
  const effectiveUserId = userId ?? storeUserId ?? undefined;
  const queryClient = useQueryClient();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const shouldFetchStatus = Boolean(bookId && effectiveUserId);

  // Always fetch count - it works for both authenticated and non-authenticated users
  const { data: favoriteCount } = useQuery({
    queryKey: ["favorite-count", bookId],
    queryFn: async () => {
      return await getFavoriteCount(bookId);
    },
    enabled: Boolean(bookId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Only fetch status when user is authenticated (for isFavorited flag)
  const {
    data: favoriteStatus,
    isLoading: isStatusLoading,
    isFetching: isStatusFetching,
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
    enabled: shouldFetchStatus,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isFavorited = favoriteStatus?.isFavorited ?? false;
  const totalFavorites =
    favoriteStatus?.totalFavorites ?? favoriteCount?.totalFavorites ?? 0;
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
      // Cancel both queries to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: ["favorite-status", bookId],
      });
      await queryClient.cancelQueries({
        queryKey: ["favorite-count", bookId],
      });

      const previousStatus =
        queryClient.getQueryData<FavoriteStatusResponseDto | null>([
          "favorite-status",
          bookId,
        ]) ?? {
          isFavorited: false,
          totalFavorites: 0,
        };

      const previousCount =
        queryClient.getQueryData<FavoriteCountResponseDto | null>([
          "favorite-count",
          bookId,
        ]) ?? {
          totalFavorites: 0,
        };

      const newCount = Math.max(
        0,
        (previousStatus.totalFavorites || previousCount.totalFavorites || 0) + 
        (currentlyFavorited ? -1 : 1)
      );

      const nextStatus: FavoriteStatusResponseDto = {
        isFavorited: !currentlyFavorited,
        totalFavorites: newCount,
      };

      const nextCount: FavoriteCountResponseDto = {
        totalFavorites: newCount,
      };

      // Update both caches optimistically
      queryClient.setQueryData(["favorite-status", bookId], nextStatus);
      queryClient.setQueryData(["favorite-count", bookId], nextCount);

      return { previousStatus, previousCount, nextStatus, nextCount };
    },
    onError: (error, _variables, context) => {
      // Rollback both caches on error
      if (context?.previousStatus) {
        queryClient.setQueryData(["favorite-status", bookId], context.previousStatus);
      }
      if (context?.previousCount) {
        queryClient.setQueryData(["favorite-count", bookId], context.previousCount);
      }

      if (error instanceof Error && error.message === "UNAUTHENTICATED") {
        setShowLoginDialog(true);
        return;
      }

      toast.error("Không thể cập nhật trạng thái yêu thích. Thử lại sau.");
    },
    onSuccess: (_data, _variables, context) => {
      if (!context?.nextStatus) return;

      toast.success(
        context.nextStatus.isFavorited
          ? "Đã thêm vào danh sách yêu thích."
          : "Đã bỏ khỏi danh sách yêu thích."
      );
    },
    onSettled: () => {
      // Invalidate both query caches to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["favorite-status", bookId] });
      queryClient.invalidateQueries({ queryKey: ["favorite-count", bookId] });
    },
  });

  const isProcessing =
    mutation.isPending || isStatusLoading || isStatusFetching;

  const formattedTotal = useMemo(
    () => new Intl.NumberFormat("vi-VN").format(totalFavorites),
    [totalFavorites]
  );

  const handleClick = useCallback(() => {
    if (!bookId) return;

    if (!effectiveUserId) {
      setShowLoginDialog(true);
      return;
    }

    mutation.mutate(isFavorited);
  }, [bookId, effectiveUserId, isFavorited, mutation]);

  return (
    <>
      <Button
        type="button"
        variant={"outline"}
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(
          "h-12 min-w-[140px] px-4 rounded-sm border border-border flex items-center justify-center gap-2 font-semibold transition-all bg-primary text-primary-foreground",
          className
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Plus className={cn("h-5 w-5", isFavorited && "fill-current")} />
        )}

        <span className="text-base font-semibold">
          {formattedTotal} {isFavorited ? "Đã thích" : "Thích"}
        </span>
      </Button>

      <LoginRequiredDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
        title="Yêu cầu đăng nhập"
        description="Vui lòng đăng nhập để thêm sách vào danh sách yêu thích của bạn."
      />
    </>
  );
}

export function FavoriteButton(props: FavoriteButtonProps) {
  return (
    <Suspense fallback={<div className="h-12 w-full" />}>
      <FavoriteButtonContent {...props} />
    </Suspense>
  );
}

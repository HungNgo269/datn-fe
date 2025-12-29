"use client";

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
import {
  FavoriteCountResponseDto,
  FavoriteStatusResponseDto,
} from "../types/favorite.type";
import { useAuthStore } from "@/app/store/useAuthStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const shouldFetchStatus = Boolean(bookId && effectiveUserId);

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

  const {
    data: favoriteCount,
    isLoading: isCountLoading,
    isFetching: isCountFetching,
  } = useQuery({
    queryKey: ["favorite-total", bookId],
    queryFn: async () => {
      try {
        const response = await getFavoriteCount(bookId);
        return response.totalFavorites;
      } catch (err) {
        if (err instanceof ApiError) {
          return 0;
        }
        throw err;
      }
    },
    enabled: Boolean(bookId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isFavorited = favoriteStatus?.isFavorited ?? false;
  const totalFavorites =
    favoriteStatus?.totalFavorites ?? favoriteCount ?? 0;
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
      await queryClient.cancelQueries({
        queryKey: ["favorite-total", bookId],
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
      queryClient.setQueryData<number>(
        ["favorite-total", bookId],
        nextState.totalFavorites
      );

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
      queryClient.invalidateQueries({ queryKey: ["favorite-total", bookId] });
    },
  });

  const isProcessing =
    mutation.isPending ||
    isStatusLoading ||
    isStatusFetching ||
    isCountLoading ||
    isCountFetching;

  const formattedTotal = new Intl.NumberFormat("vi-VN").format(totalFavorites);

  const handleClick = () => {
    if (!bookId) return;

    if (!effectiveUserId) {
      const search = searchParams?.toString();
      const nextPath =
        pathname && pathname.length > 0
          ? search && search.length > 0
            ? `${pathname}?${search}`
            : pathname
          : "/";
      const callbackUrl = encodeURIComponent(nextPath);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    mutation.mutate(isFavorited);
  };

  return (
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
  );
}

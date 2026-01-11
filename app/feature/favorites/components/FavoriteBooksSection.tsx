"use client";

import { useState } from "react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { getMyFavoriteBooks } from "../api/favorites.api";
import { FavoriteBookCard } from "./FavoriteBookCard";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export function FavoriteBooksSection() {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["my-favorite-books", page],
    queryFn: () => getMyFavoriteBooks({ page, limit: PAGE_SIZE }),
    enabled: Boolean(user),
  });

  if (!user) {
    return (
      <div className="rounded-2xl p-10 text-center space-y-4">
        <h2 className="text-2xl font-semibold">Bạn chưa đăng nhập</h2>
        <p className="text-sm text-muted-foreground">
          Đăng nhập để xem danh sách sách yêu thích của bạn.
        </p>
      </div>
    );
  }

  const favorites = data?.data ?? [];
  const meta = data?.meta;
  const totalFavorites = meta?.total ?? 0;
  const canGoPrev = page > 1;
  const canGoNext = Boolean(meta?.hasNextPage);

  return (
    <section className="rounded-2xl  p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Sách yêu thích
          </h2>
          <p className="text-sm text-muted-foreground">
            Bạn có {totalFavorites} truyện yêu thích.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Làm mới
        </Button>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Không thể tải danh sách yêu thích. Vui lòng thử lại.
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center space-y-2 rounded-xl border border-dashed p-10 text-center">
          <p className="text-base font-medium">Danh sách yêu thích trống</p>
          <p className="text-sm text-muted-foreground">
            Hãy khám phá thêm sách và nhấn tim để lưu vào đây nhé.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <FavoriteBookCard key={favorite.id} favorite={favorite} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Trang {page} / {meta?.totalPages ?? 1}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={!canGoPrev || isFetching}
            className={cn(!canGoPrev && "opacity-60")}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!canGoNext || isFetching}
            className={cn(!canGoNext && "opacity-60")}
          >
            Sau
          </Button>
        </div>
      </div>
    </section>
  );
}

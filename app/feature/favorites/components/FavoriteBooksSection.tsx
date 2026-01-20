"use client";

import { Suspense, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import { Button } from "@/components/ui/button";
import { getMyFavoriteBooks } from "../api/favorites.api";
import { FavoriteBookCard } from "./FavoriteBookCard";

const PAGE_SIZE = 12;

function FavoriteBooksSectionContent() {
  const user = useAuthStore((state) => state.user);
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get("page");
  const parsedPage = parseInt(pageParam || "1", 10);
  const page = Math.max(1, parsedPage);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["my-favorite-books", page],
    queryFn: () => getMyFavoriteBooks({ page, limit: PAGE_SIZE }),
    enabled: Boolean(user),
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user) return null;

  const favorites = data?.data ?? [];
  const meta = data?.meta;
  const totalFavorites = meta?.total ?? 0;

  return (
    <section className="space-y-6 rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Sách yêu thích của bạn
          </h2>
          <p className="text-sm text-muted-foreground">
            Bạn có {totalFavorites} cuốn sách yêu thích.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
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
          <p className="text-base font-medium">Chưa có sách yêu thích</p>
          <p className="text-sm text-muted-foreground">
            Hãy thêm sách vào danh sách yêu thích để xem tại đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {favorites.map((favorite) => (
            <FavoriteBookCard key={favorite.id} favorite={favorite} />
          ))}
        </div>
      )}

      {meta && <Pagination meta={meta} />}
    </section>
  );
}

export function FavoriteBooksSection() {
  return (
    <Suspense fallback={<div className="min-h-[200px] w-full" />}>
      <FavoriteBooksSectionContent />
    </Suspense>
  );
}

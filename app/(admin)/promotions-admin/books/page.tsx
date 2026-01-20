"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getBookPromotions, deletePromotion } from "@/app/feature/promotions/api/promotions.api";
import { AdminPromotionList } from "@/app/feature/promotions/components/adminPromotionList";

function BookPromotionsPageContent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [showFetching, setShowFetching] = useState(false);
  const fetchStartRef = useRef<number | null>(null);

  const { data: promotions, isLoading, isError, isFetching } = useQuery({
    queryKey: ["promotions", "book"],
    queryFn: getBookPromotions,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (isFetching) {
      fetchStartRef.current = Date.now();
      setShowFetching(true);
    } else if (showFetching) {
      const elapsed = Date.now() - (fetchStartRef.current ?? 0);
      const remaining = Math.max(0, 500 - elapsed);
      timeoutId = setTimeout(() => {
        setShowFetching(false);
      }, remaining);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isFetching, showFetching]);

  const deleteMutation = useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Xóa khuyến mãi thành công");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Xóa khuyến mãi thất bại."
      );
    },
  });

  const handleDelete = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  if (isError)
    return (
      <div className="p-10 text-rose-600 text-center">
        Không thể tải danh sách khuyến mãi sách
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 relative overflow-y-auto">
      <div className="max-w-7xl mx-auto relative space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Khuyến mãi sách
            </h1>
            <p className="text-slate-600">
              Quản lý các chương trình khuyến mãi cho sách
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <Link href="/promotions-admin/books/create">
              <Button className="h-11 bg-primary text-white hover:bg-primary/90">
                <Plus className="h-5 w-5 mr-2" /> Thêm khuyến mãi
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <AdminPromotionList
            promotions={promotions ?? []}
            onEdit={(promotion) => {
              router.push(`/promotions-admin/books/${promotion.id}/edit`);
            }}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
            isFetching={showFetching}
          />
        )}
      </div>
    </div>
  );
}

export default function BookPromotionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BookPromotionsPageContent />
    </Suspense>
  );
}

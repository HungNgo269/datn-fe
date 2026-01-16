"use client";

import { Suspense, useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import { deleteBanner, getBanners } from "@/app/feature/banner/api/banner.api";
import { Banner } from "@/app/feature/banner/types/banner.types";
import { AdminBannerList } from "@/app/feature/banner/components/adminBannerList";
import { BannerDialog } from "@/app/feature/banner/components/adminBannerDialog";

export default function BannersPage() {
  const queryClient = useQueryClient();

  const pageParams = useSearchParams().get("page");
  const parsedPage = parseInt(pageParams || "1", 10);
  const page = Math.max(1, parsedPage);
  const pageSize = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["banners", page],
    queryFn: () => getBanners({ page, limit: pageSize }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Xóa banner thành công");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Xóa thất bại");
    },
  });

  const handleCreate = useCallback(() => {
    setSelectedBanner(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((banner: Banner) => {
    setSelectedBanner(banner);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const banners = data?.data ?? [];
  const meta = data?.meta ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 relative overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý banner
            </h1>
            <p className="text-slate-600">
              Quản lý banner, có thể chọn vị trí hiển thị di động
            </p>
          </div>
          <Button
            className="h-11 bg-primary text-white hover:bg-primary/85"
            onClick={handleCreate}
          >
            <Plus className="mr-2 h-5 w-5" /> Thêm mới
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : isError ? (
          <div className="p-10 text-rose-600 text-center">
            Không thể tải banner
          </div>
        ) : (
          <>
            <AdminBannerList
              banners={banners}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
            {meta && <Pagination meta={meta} />}
          </>
        )}

        <BannerDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          bannerToEdit={selectedBanner}
        />
      </div>
    </div>
  );
}

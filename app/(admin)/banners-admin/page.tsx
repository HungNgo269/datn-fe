"use client";

import { useState } from "react";
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
      toast.success("Đã xóa banner!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Xóa thất bại");
    },
  });

  const handleCreate = () => {
    setSelectedBanner(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-destructive text-center">
        Không thể tải dữ liệu banner
      </div>
    );
  }

  const banners = data?.data;
  const meta = data?.meta;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Banners</h1>
          <p className="text-muted-foreground">
            Thiết lập các banner quảng cáo, sự kiện trên trang chủ và sidebar
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </div>

      <AdminBannerList
        banners={banners!}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      {meta && <Pagination meta={meta} />}

      <BannerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        bannerToEdit={selectedBanner}
      />
    </div>
  );
}

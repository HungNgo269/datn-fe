"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Category } from "@/app/feature/categories/types/listCategories";
import { CategoryDialog } from "@/app/feature/categories/components/adminCategoryDialog";
import {
  deleteCategory,
  getCategories,
} from "@/app/feature/categories/api/categories.api";
import { AdminCategoryList } from "@/app/feature/categories/components/adminCategoryList";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import { useSearchParams } from "next/navigation";

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const pageParams = useSearchParams().get("page");
  const parsedPage = parseInt(pageParams || "1", 10);
  const page = Math.max(1, parsedPage);
  const pageSize = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories", page],
    queryFn: () => getCategories({ page, limit: pageSize }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Đã xóa danh mục!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Xóa thất bại");
    },
  });

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
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
        Không thể tải dữ liệu
      </div>
    );
  }

  const categories = data?.data;
  const meta = data?.meta;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Thể loại
          </h1>
          <p className="text-muted-foreground">
            Danh sách các thể loại sách trong hệ thống
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </div>

      <AdminCategoryList
        categories={categories!}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      {meta && <Pagination meta={meta} />}

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categoryToEdit={selectedCategory}
      />
    </div>
  );
}

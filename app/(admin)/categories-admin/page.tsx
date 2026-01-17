"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Search } from "lucide-react";
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
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/app/share/hook/useDebounce";

function CategoryPageContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParams = searchParams.get("page");
  const queryParams = searchParams.get("q") || "";
  const parsedPage = parseInt(pageParams || "1", 10);
  const page = Math.max(1, parsedPage);
  const pageSize = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState(queryParams);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const prevSearchRef = useRef(debouncedSearch);
  const [showFetching, setShowFetching] = useState(false);
  const fetchStartRef = useRef<number | null>(null);

  useEffect(() => {
    setSearchQuery(queryParams);
  }, [queryParams]);

  useEffect(() => {
    if (prevSearchRef.current === debouncedSearch) return;
    prevSearchRef.current = debouncedSearch;

    const params = new URLSearchParams(searchParams?.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.replace(`/categories-admin?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["categories", page, debouncedSearch],
    queryFn: () =>
      getCategories(
        debouncedSearch
          ? {
              endpoint: "/categories/search",
              page,
              limit: pageSize,
              q: debouncedSearch,
            }
          : {
              page,
              limit: pageSize,
            }
      ),
    placeholderData: (previousData) => previousData,
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
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Xóa thể loại thành công");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Xóa thất bại");
    },
  });

  const handleCreate = useCallback(() => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const categories = data?.data ?? [];
  const meta = data?.meta ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 relative overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý thể loại
            </h1>
            <p className="text-slate-600">
              Quản lý các danh mục của bạn một cách gọn gàng, dễ dàng tìm kiếm
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[280px]">
              <input
                type="text"
                placeholder="Tìm kiếm thể loại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <Button
              className="h-11 bg-primary text-white hover:bg-primary/85"
              onClick={handleCreate}
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-slate-500" />
          </div>
        ) : isError ? (
          <div className="p-10 text-rose-600 text-center">
            Không thể tải thể loại
          </div>
        ) : (
          <>
            <AdminCategoryList
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isFetching={showFetching}
              isDeleting={deleteMutation.isPending}
            />
            {meta && <Pagination meta={meta} />}
          </>
        )}

        <CategoryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          categoryToEdit={selectedCategory}
        />
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CategoryPageContent />
    </Suspense>
  );
}

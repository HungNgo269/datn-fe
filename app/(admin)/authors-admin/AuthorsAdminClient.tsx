"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { deleteAuthor, getAuthors } from "@/app/feature/author/api/authors.api";
import { AdminAuthorList } from "@/app/feature/author/components/adminAuthorList";
import { AuthorDialog } from "@/app/feature/author/components/adminAuthorDialog";
import { AuthorInfo } from "@/app/feature/author/types/authors.types";
import { useDebounce } from "@/app/share/hook/useDebounce";

function AuthorsAdminClientContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParams = searchParams.get("page");
  const queryParams = searchParams.get("q") || "";

  const parsedPage = parseInt(pageParams || "1", 10);
  const page = Math.max(1, parsedPage);
  const pageSize = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorInfo | null>(null);
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
    router.replace(`/authors-admin?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["authors", page, debouncedSearch],
    queryFn: () =>
      getAuthors(
        debouncedSearch
          ? {
              endpoint: "/authors/search",
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
    mutationFn: deleteAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      toast.success("Đã xóa tác giả!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Xóa thất bại");
    },
  });

  const handleCreate = useCallback(() => {
    setSelectedAuthor(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((author: AuthorInfo) => {
    setSelectedAuthor(author);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
    deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  if (isError)
    return (
      <div className="p-10 text-destructive text-center">
        Không thể tải dữ liệu
      </div>
    );

  const authors = data?.data ?? [];
  const meta = data?.meta ?? null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1 w-[400px]">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Tác Giả</h1>
          <p className="text-muted-foreground">
            Danh sách các tác giả trong hệ thống
          </p>
        </div>

        <div className="w-full flex flex-row-reverse gap-3 ">
          <Button className="h-10" onClick={handleCreate}>
            <Plus className=" h-5 w-5" /> Thêm mới
          </Button>
          <div className="relative min-w-[300px]">
            <input
              type="text"
              placeholder="Tìm kiếm tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-md p-2 pr-9 w-full"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          <AdminAuthorList
            authors={authors || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
            isFetching={showFetching}
          />
          {meta && <Pagination meta={meta} />}
        </>
      )}

      <AuthorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        authorToEdit={selectedAuthor}
      />
    </div>
  );
}

export default function AuthorsAdminClient() {
  return (
    <Suspense fallback={<div className="min-h-[200px] w-full" />}>
      <AuthorsAdminClientContent />
    </Suspense>
  );
}

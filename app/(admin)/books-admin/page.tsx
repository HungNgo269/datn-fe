"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { AdminBookList } from "@/app/feature/books-admin/components/adminBookList";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import { getBooks, deleteBook } from "@/app/feature/books/api/books.api";
import { Book } from "@/app/feature/books/types/books.type";
import { useDebounce } from "@/app/share/hook/useDebounce";

export default function BooksPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = searchParams.get("page");
  const queryParam = searchParams.get("q") || "";
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const pageSize = 5;

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const prevSearchRef = useRef(debouncedSearch);
  const [showFetching, setShowFetching] = useState(false);
  const fetchStartRef = useRef<number | null>(null);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (prevSearchRef.current === debouncedSearch) return;
    prevSearchRef.current = debouncedSearch;

    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.replace(`/books-admin?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["books", page, debouncedSearch],
    queryFn: () =>
      getBooks(
        debouncedSearch
          ? {
              endpoint: "/books/search",
              page,
              limit: pageSize,
              q: debouncedSearch,
            }
          : {
              page,
              limit: pageSize,
            }
      ),
    placeholderData: (prev) => prev,
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
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Đã xóa sách!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Xóa thất bại");
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (book: Book) => {
    router.push(`/books-admin/edit/${book.slug}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-destructive">
        <p>Không thể tải dữ liệu.</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  const books = data?.data;
  const meta = data?.meta;

  return (
    <div className=" mx-auto p-6 space-y-8 max-w-full">
      <div className="flex items-center justify-between ">
        <div className="flex flex-col gap-1 w-[400px]">
          <h1 className="text-3xl font-bold tracking-tight">
            Trang quản lý sách
          </h1>
          <p className="text-muted-foreground mt-1">
            Danh sách các sách trong hệ thống
          </p>
        </div>

        <div className="w-full max-w-1/3 flex flex-row-reverse gap-3 ">
          <Link href="/books-admin/create">
            <Button className="h-10">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          </Link>
          <div className="relative min-w-[300px]">
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-md p-2 pr-9 w-full"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <AdminBookList
        books={books!}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
        isFetching={showFetching}
      />

      {meta && <Pagination meta={meta} />}
    </div>
  );
}

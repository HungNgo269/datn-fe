"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AdminBookList } from "@/app/feature/books-admin/components/adminBookList";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import { getBooks, deleteBook } from "@/app/feature/books/api/books.api";
import { Book } from "@/app/feature/books/types/books.type";
import { useDebounce } from "@/app/share/hook/useDebounce";

function BooksPageContent() {
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

    const params = new URLSearchParams(searchParams?.toString());
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
      toast.success("Book deleted.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    },
  });

  const handleDelete = useCallback(
    (id: number) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleEdit = useCallback(
    (book: Book) => {
      router.push(`/books-admin/edit/${book.slug}`);
    },
    [router]
  );

  const books = data?.data ?? [];
  const meta = data?.meta ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 relative overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Quản lý sách</h1>
            <p className="text-slate-600">
              Xem và quản lý các danh mục của sách
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[280px]">
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <Link href="/books-admin/create">
              <Button className="h-11 bg-primary text-white hover:bg-primary/85">
                <Plus className="mr-2 h-4 w-4" /> Thêm sách
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : isError ? (
          <div className="flex h-[50vh] flex-col items-center justify-center text-rose-600">
            <p>Không thể tải sách</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Thử lại
            </Button>
          </div>
        ) : (
          <>
            <AdminBookList
              books={books}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
              isFetching={showFetching}
            />
            {meta && <Pagination meta={meta} />}
          </>
        )}
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BooksPageContent />
    </Suspense>
  );
}

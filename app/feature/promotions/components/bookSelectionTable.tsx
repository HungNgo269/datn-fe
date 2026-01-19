"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Loader2, Search, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getBooks } from "@/app/feature/books/api/books.api";
import Image from "next/image";

import { useDebounce } from "@/app/share/hook/useDebounce";

interface BookSelectionTableProps {
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

function _BookSelectionTable({
  selectedIds,
  onSelectionChange,
}: BookSelectionTableProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const pageSize = 5;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["promotion-books", page, debouncedSearchQuery],
    queryFn: () => getBooks({ page, limit: pageSize, q: debouncedSearchQuery, endpoint: "/admin/books" }),
  });

  const books = data?.data ?? [];
  const meta = data?.meta ?? null;

  const isAllSelected = useMemo(() => {
    if (books.length === 0) return false;
    return books.every((book) => selectedIds.includes(book.id));
  }, [books, selectedIds]);

  const isSomeSelected = useMemo(() => {
    if (books.length === 0) return false;
    return books.some((book) => selectedIds.includes(book.id)) && !isAllSelected;
  }, [books, selectedIds, isAllSelected]);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      const currentPageIds = books.map((book) => book.id);
      onSelectionChange(selectedIds.filter((id) => !currentPageIds.includes(id)));
    } else {
      const currentPageIds = books.map((book) => book.id);
      const newSelected = [...selectedIds];
      currentPageIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onSelectionChange(newSelected);
    }
  }, [books, selectedIds, isAllSelected, onSelectionChange]);

  const handleSelectOne = useCallback(
    (id: number) => {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    },
    [selectedIds, onSelectionChange]
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm sách..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Selection summary */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Check className="h-4 w-4" />
          <span>
            Đã chọn <strong>{selectedIds.length}</strong> sách
          </span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
              </TableHead>
              <TableHead className="w-16 text-slate-700">Ảnh</TableHead>
              <TableHead className="text-slate-700">Tên sách</TableHead>
              <TableHead className="text-slate-700">Tác giả</TableHead>
              <TableHead className="text-right text-slate-700">Giá gốc</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32">
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin text-slate-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  Không tìm thấy sách nào
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow
                  key={book.id}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    selectedIds.includes(book.id) ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleSelectOne(book.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(book.id)}
                      onCheckedChange={() => handleSelectOne(book.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative w-10 h-14 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                      <Image
                        src={book.coverImage || "/placeholder-book.png"}
                        width={40}
                        height={56}
                        alt={book.title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-book.png";
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {book.title}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {book.authors?.map((a) => a.author.name).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-600">
                    {book.price?.toLocaleString("vi-VN")}₫
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Inline Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600">
            Trang {page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
export const BookSelectionTable = memo(_BookSelectionTable);

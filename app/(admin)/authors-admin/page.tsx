"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import { useSearchParams } from "next/navigation";
import { deleteAuthor, getAuthors } from "@/app/feature/author/api/authors.api";
import { AdminAuthorList } from "@/app/feature/author/components/adminAuthorList";
import { AuthorDialog } from "@/app/feature/author/components/adminAuthorDialog";
import { AuthorInfo } from "@/app/feature/author/types/authors.types";
import Search from "@/app/share/components/ui/search/adminSearch";

export default function AuthorsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const pageParams = searchParams.get("page");
  const queryParams = searchParams.get("q") || "";

  const parsedPage = parseInt(pageParams || "1", 10);
  const page = Math.max(1, parsedPage);
  const pageSize = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorInfo | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["authors", page, queryParams],
    queryFn: () => getAuthors({ page, limit: pageSize }),
    placeholderData: (previousData) => previousData,
  });

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

  const handleCreate = () => {
    setSelectedAuthor(null);
    setIsDialogOpen(true);
  };
  const handleEdit = (author: AuthorInfo) => {
    setSelectedAuthor(author);
    setIsDialogOpen(true);
  };
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  if (isError)
    return (
      <div className="p-10 text-destructive text-center">
        Không thể tải dữ liệu
      </div>
    );

  const authors = data?.data;
  const meta = data?.meta;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Tác Giả</h1>
          <p className="text-muted-foreground">
            Danh sách các tác giả trong hệ thống
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </div>

      {/* <div className="w-full md:w-1/3">
        <Search placeholder="Tìm kiếm tác giả..." />
      </div> */}

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

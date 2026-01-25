"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Option } from "@/components/ui/AsyncCreatableSelect";
import { getBookBySlug } from "@/app/feature/books/api/books.api";
import { Book } from "@/app/feature/books/types/books.type";
import { BookFormState } from "@/app/feature/books-upload/schema/uploadBookSchema";
import { useBookSubmit } from "@/app/feature/books/hooks/useBookSubmit";
import { ConfirmDialog } from "@/app/share/components/ui/dialog/ConfirmDialog";
import { BookForm } from "@/app/feature/books-upload/components/BookForm";

export default function EditBookPage() {
  const { slug } = useParams<{ slug: string | string[] }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bookSlug = Array.isArray(slug) ? slug[0] : slug;
  
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [initialFormData, setInitialFormData] = useState<BookFormState | undefined>(undefined);
  const [authorOptions, setAuthorOptions] = useState<Option[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);

  const { submitBook, isSubmitting, statusMessage, error } = useBookSubmit();

  useEffect(() => {
    if (!bookSlug) return;

    const fetchBook = async () => {
      try {
        setIsLoading(true);
        const book: Book = await getBookBySlug(bookSlug);

        if (!book) {
          toast.error("Không tìm thấy sách");
          router.push("/books-admin");
          return;
        }

        const parsedPrice =
          typeof book.price === "number" ? book.price : Number(book.price);

        const mappedData: BookFormState = {
          id: book.id,
          title: book.title,
          slug: book.slug,

          cover: book.coverImage,
          file: book.sourceKey ? "current_file_placeholder" : undefined,
          currentSourceKey: book.sourceKey,
          currentCoverKey: book.coverImage,
          authorIds: book.authors.map((a) => a.author.id),
          categoryIds: book.categories.map((c) => c.category.id),

          description: book.description || "",
          price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
          freeChapters: book.freeChapters || 0,
          accessType: (book.accessType?.toUpperCase() as "FREE" | "PURCHASE" | "MEMBERSHIP") || "FREE",
        };

        setInitialFormData(mappedData);
        setAuthorOptions(
          book.authors.map((item) => ({
            value: item.author.id,
            label: item.author.name,
          }))
        );
        setCategoryOptions(
          book.categories.map((item) => ({
            value: item.category.id,
            label: item.category.name,
          }))
        );
      } catch (error) {
        console.error(error);
        toast.error("Lỗi khi tải thông tin sách");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [bookSlug, router]);

  const handleSubmit = useCallback(
    async (data: BookFormState) => {
        // Merge with initial data to ensure we have the ID and original keys if not changed
      const finalData: BookFormState = {
        ...initialFormData, 
        ...data,
      };

      const result = await submitBook(finalData, "edit");

      if (result?.success) {
        toast.success("Cập nhật sách thành công!");
        await queryClient.invalidateQueries({ queryKey: ["books"] });
        router.push("/books-admin");
      } else {
        toast.error(result?.error || "Có lỗi xảy ra khi cập nhật.");
      }
    },
    [initialFormData, router, submitBook, queryClient]
  );

  const handleCancel = useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const confirmCancel = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Đang tải thông tin sách...
          </p>
        </div>
      </div>
    );
  }

  if (!initialFormData) return null;

  return (
    <div className="bg-background min-h-screen pb-10">
      <div className="container max-w-7xl mx-auto pt-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/books-admin">
            <Button
              variant="ghost"
              size="sm"
              className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>

        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Chỉnh Sửa Sách
            </h1>
            <p className="text-muted-foreground mt-1">
              Cập nhật thông tin cho sách:{" "}
              <span className="font-semibold text-foreground">
                {initialFormData.title}
              </span>
            </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto mb-8">
          {isSubmitting && statusMessage && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm font-medium text-primary">
                  {statusMessage}
                </p>
              </div>
              <div className="w-full bg-primary/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500 ease-in-out"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          )}

          {error && !isSubmitting && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 mt-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm font-medium text-destructive">
                {error}. Vui lòng thử lại.
              </p>
            </div>
          )}
        </div>

        <BookForm
          isEdit={true}
          initialData={initialFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          initialAuthorOptions={authorOptions}
          initialCategoryOptions={categoryOptions}
        />
      </div>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Hủy chỉnh sửa"
        description="Bạn có chắc muốn hủy chỉnh sửa? Các thay đổi chưa lưu sẽ bị mất."
        confirmText="Hủy chỉnh sửa"
        cancelText="Tiếp tục"
        onConfirm={confirmCancel}
        variant="destructive"
      />
    </div>
  );
}

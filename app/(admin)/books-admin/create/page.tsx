"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useBookSubmit } from "@/app/feature/books/hooks/useBookSubmit";
import { BookFormState } from "@/app/feature/books-upload/schema/uploadBookSchema";
import { ConfirmDialog } from "@/app/share/components/ui/dialog/ConfirmDialog";
import { BookForm } from "@/app/feature/books-upload/components/BookForm";

export default function CreateBookPage() {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { submitBook, isSubmitting, statusMessage, error } = useBookSubmit();

  const handleSubmit = useCallback(
    async (data: BookFormState) => {
      const result = await submitBook(data, "create");

      if (result?.success) {
        toast.success(
          "Upload sách thành công! Hãy chờ một chút để hệ thống cập nhật sách."
        );
        router.push("/books-admin");
      } else {
        toast.error(result?.error || "Có lỗi xảy ra trong quá trình upload.");
      }
    },
    [submitBook, router]
  );

  const handleCancel = useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const confirmCancel = useCallback(() => {
    router.back();
  }, [router]);

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
          <h1 className="text-3xl font-bold tracking-tight">Upload Sách Mới</h1>
          <p className="text-muted-foreground mt-1">
            Thêm sách mới vào hệ thống thư viện.
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
                {error}. Vui lòng kiểm tra và thử lại.
              </p>
            </div>
          )}
        </div>

        <BookForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Hủy upload sách"
        description="Bạn có chắc muốn hủy upload? Dữ liệu sẽ không được lưu."
        confirmText="Hủy upload"
        cancelText="Tiếp tục"
        onConfirm={confirmCancel}
        variant="destructive"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useBookSubmit } from "@/app/feature/books/hooks/useBookSubmit";
import {
  BookFormState,
  Step1FormData,
  Step2FormData,
} from "@/app/feature/books-upload/schema/uploadBookSchema";
import { Step1Form } from "@/app/feature/books-upload/components/step1Form";
import { Step2Form } from "@/app/feature/books-upload/components/step2Form";

export default function CreateBookPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookFormState>({
    title: "",
    slug: "",
    file: undefined,
    cover: undefined,
    authorIds: [],
    categoryIds: [],
    price: 0,
    freeChapters: 0,
    description: "",
  });
  const { submitBook, isSubmitting, statusMessage, error } = useBookSubmit();

  const handleStep1Next = (data: Step1FormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Back = (data: Step2FormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(1);
  };

  const handleStep2Submit = async (data: Step2FormData) => {
    const finalData = { ...formData, ...data };
    const result = await submitBook(finalData, "create");

    if (result?.success) {
      toast.success(
        "Upload sách thành công!, Hãy chờ một chút để chúng tôi cập nhật sách"
      );
      router.push("/books-admin");
    } else {
      toast.error(result?.error || "Có lỗi xảy ra trong quá trình upload.");
    }
  };
  const handleCancel = () => {
    if (confirm("Bạn có chắc muốn hủy upload? Dữ liệu sẽ không được lưu.")) {
      router.back();
    }
  };

  return (
    <div className="bg-background min-h-screen pb-10">
      <div className="container max-w-5xl mx-auto pt-6">
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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Upload Sách Mới
            </h1>
            <p className="text-muted-foreground">
              Thêm sách mới vào hệ thống thư viện.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/50 p-1.5 rounded-lg border">
            <div
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentStep === 1
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              1. File & Bìa
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentStep === 2
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              2. Thông tin chi tiết
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto">
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
                  style={{
                    width:
                      statusMessage === "cover"
                        ? "25%"
                        : statusMessage === "file"
                        ? "60%"
                        : statusMessage === "saving"
                        ? "90%"
                        : "100%",
                  }}
                />
              </div>
            </div>
          )}

          {error && !isSubmitting && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 mt-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm font-medium text-destructive">
                {error}. Vui lòng kiểm tra và nhấn nút Hoàn tất & Đăng bên dưới
                để thử lại.
              </p>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8">
          {currentStep === 1 && (
            <Step1Form
              onNext={handleStep1Next}
              onCancel={handleCancel}
              defaultValues={formData}
              isEdit={false}
            />
          )}

          {currentStep === 2 && (
            <Step2Form
              step1Data={formData}
              defaultValues={formData}
              onBack={handleStep2Back}
              onSubmit={handleStep2Submit}
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}

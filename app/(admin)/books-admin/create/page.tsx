"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useBookUpload } from "@/app/feature/books/hooks/useBookUpload";
import {
  Step1Data,
  Step2Data,
} from "@/app/feature/books-upload/schema/uploadBookSchema";
import { Step1Form } from "@/app/feature/books-upload/components/step1Form";
import { Step2Form } from "@/app/feature/books-upload/components/step2Form";

export default function CreateBookPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  const { uploadBook, isUploading, progress, error } = useBookUpload();

  const handleStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;

    const uploadData = { ...step1Data, ...data };
    const result = await uploadBook(uploadData);

    if (result?.success) {
      toast.success("Upload sách thành công!");
      router.push("/books-admin");
    } else {
      toast.error(result?.error || "Upload thất bại");
    }
  };

  const handleCancel = () => {
    if (confirm("Bạn có chắc muốn hủy upload? Dữ liệu sẽ không được lưu.")) {
      router.back();
    }
  };

  return (
    <div className="bg-background ">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Upload Sách Mới
            </h1>
            <p className="text-muted-foreground">
              Thêm sách mới vào hệ thống thư viện.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border">
            <div
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentStep === 1
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              1. File & Bìa
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentStep === 2
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              2. Thông tin chi tiết
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto">
        <div className="max-w-3xl mx-auto mb-8">
          {progress && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm font-medium text-primary">
                {progress.message}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-sm p-6 md:p-8">
          {currentStep === 1 && (
            <Step1Form onNext={handleStep1Submit} onCancel={handleCancel} />
          )}

          {currentStep === 2 && step1Data && (
            <Step2Form
              step1Data={step1Data}
              onBack={() => setCurrentStep(1)}
              onCancel={handleCancel}
              onSubmit={handleStep2Submit}
              isSubmitting={isUploading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

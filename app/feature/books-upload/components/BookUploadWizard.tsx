"use client";

import { useState } from "react";
import { ClockFading, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBookUpload } from "../../books/hooks/useBookUpload";
import { toast } from "sonner";
import { Step1Data, Step2Data } from "../schema/uploadBookSchema";
import { Step1Form } from "./step1Form";
import { Step2Form } from "./step2Form";

export interface BookUploadWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BookUploadWizard({
  open,
  onOpenChange,
  onSuccess,
}: BookUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  const { uploadBook, isUploading, progress, error } = useBookUpload();

  const handleStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    console.log("datastep`1", data);
    setCurrentStep(2);
  };

  const handleStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;

    const uploadData = { ...step1Data, ...data };

    const result = await uploadBook(uploadData);

    if (result?.success) {
      toast.success("Upload sách thành công!");
      handleClose();
      onSuccess?.();
    } else {
      toast.error(result?.error || "Upload thất bại");
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setStep1Data(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-full flex flex-col p-0 gap-0 overflow-hidden bg-background text-foreground sm:rounded-lg">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span>Upload Sách Mới</span>
            <span className="text-sm text-muted-foreground font-normal">
              - Bước {currentStep}/2
            </span>
          </DialogTitle>

          <div className="flex gap-2 mt-4">
            <div
              className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                currentStep >= 1 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                currentStep >= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {progress && (
            <div className="bg-primary/10 border border-primary/20 rounded-md p-3 mb-6 animate-in fade-in zoom-in-95">
              <p className="text-sm text-primary flex items-center gap-2 font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                {progress.message}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-6 animate-in fade-in zoom-in-95">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {currentStep === 1 && (
            <Step1Form onNext={handleStep1Submit} onCancel={handleClose} />
          )}

          {currentStep === 2 && step1Data && (
            <Step2Form
              step1Data={step1Data}
              onBack={() => setCurrentStep(1)}
              onCancel={handleClose}
              onSubmit={handleStep2Submit}
              isSubmitting={isUploading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePreview } from "./ImagePreview";
import { generateSlug } from "../../books/helper";
import { useState } from "react";
import { Step1Data, Step1Schema } from "../schema/uploadBookSchema";
import { UploadBookButton } from "./uploadBookButton";

interface Step1FormProps {
  onNext: (data: Step1Data) => void;
  onCancel: () => void;
}

export function Step1Form({ onNext, onCancel }: Step1FormProps) {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const form = useForm<Step1Data>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      title: "",
      slug: "",
      cover: "",
      file: "",
    },
  });

  const handleFileChange = (file: File) => {
    form.setValue("file", file);
    const currentTitle = form.getValues("title");
    if (!currentTitle) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      form.setValue("title", fileName);
      form.setValue("slug", generateSlug(fileName));
    }
  };

  const handleCoverChange = (file: File) => {
    form.setValue("cover", file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeCover = () => {
    form.setValue("cover", undefined);
    setCoverPreview(null);
  };

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5 order-2 md:order-1">
          <UploadBookButton
            label="File Sách"
            accept=".pdf,.epub,.mobi"
            buttonText="Chọn file EPUB/PDF"
            required
            onChange={handleFileChange}
            selectedFile={form.watch("file")}
            error={form.formState.errors.file?.message as string}
          />

          <div className="space-y-2">
            <Label htmlFor="title">Tên Sách</Label>
            <Input
              id="title"
              className="bg-background"
              {...form.register("title")}
              placeholder="Ví dụ: Đắc Nhân Tâm"
              onChange={(e) => {
                form.setValue("title", e.target.value);
                if (e.target.value) {
                  form.setValue("slug", generateSlug(e.target.value));
                }
              }}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive font-medium">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              className="bg-muted text-muted-foreground"
              {...form.register("slug")}
              placeholder="dac-nhan-tam"
              readOnly
            />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive font-medium">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <UploadBookButton
              label="Ảnh Bìa"
              accept="image/*"
              buttonText="Chọn ảnh bìa"
              onChange={handleCoverChange}
            />
          </div>
        </div>

        <div className="order-1 md:order-2 flex flex-col md:border-l md:pl-8 border-border">
          <Label className="mb-3 block">Xem Trước Bìa</Label>
          <div className="flex-1 flex flex-col items-center justify-start min-h-[200px] bg-muted/30 rounded-lg border border-border border-dashed p-4">
            {coverPreview ? (
              <ImagePreview
                src={coverPreview}
                alt="Cover preview"
                onRemove={removeCover}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm text-center">
                <div className="w-20 h-28 bg-muted rounded mb-2 animate-pulse" />
                Chưa có ảnh bìa
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border sticky bottom-0 bg-background/95 backdrop-blur z-10">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Tiếp theo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

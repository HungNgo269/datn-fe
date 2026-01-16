import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePreview } from "./ImagePreview";
import { generateSlug } from "../../books/helper";
import {
  Step1CreateSchema,
  Step1EditSchema,
  Step1FormData,
} from "../schema/uploadBookSchema";
import { UploadBookButton } from "./uploadBookButton";

interface Step1FormProps {
  onNext: (data: Step1FormData) => void;
  onCancel: () => void;
  defaultValues?: Step1FormData;
  isEdit?: boolean;
}

export function Step1Form({
  onNext,
  onCancel,
  defaultValues,
  isEdit = false,
}: Step1FormProps) {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const schema = isEdit ? Step1EditSchema : Step1CreateSchema;

  const form = useForm<Step1FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title || "",
      slug: defaultValues?.slug || "",
      file: defaultValues?.file,
      cover: defaultValues?.cover,
    },
  });
  const watchedFile = useWatch({
    control: form.control,
    name: "file",
  });

  useEffect(() => {
    form.reset({
      title: defaultValues?.title || "",
      slug: defaultValues?.slug || "",
      file: defaultValues?.file,
      cover: defaultValues?.cover,
    });
  }, [defaultValues, form]);

  useEffect(() => {
    const cover = defaultValues?.cover;
    let frame: number | null = null;
    if (cover) {
      if (typeof cover === "string") {
        frame = requestAnimationFrame(() => setCoverPreview(cover));
      } else if (cover instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => setCoverPreview(reader.result as string);
        reader.readAsDataURL(cover);
      }
    } else {
      frame = requestAnimationFrame(() => setCoverPreview(null));
    }
    return () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [defaultValues]);

  const handleFileChange = useCallback(
    (file: File) => {
      form.setValue("file", file, { shouldValidate: true });
      if (!isEdit && !form.getValues("title")) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        form.setValue("title", fileName);
        form.setValue("slug", generateSlug(fileName));
      }
    },
    [form, isEdit]
  );

  const handleCoverChange = useCallback(
    (file: File) => {
      form.setValue("cover", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [form]
  );

  const removeCover = useCallback(() => {
    form.setValue("cover", undefined);
    setCoverPreview(null);
  }, [form]);

  const fileLabel = useMemo(() => {
    const file = watchedFile;
    if (file instanceof File) return file.name;
    if (typeof file === "string" && file.length > 0) return "File sách";
    return undefined;
  }, [watchedFile]);

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="flex h-full flex-col">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="order-2 space-y-5 md:order-1">
          <UploadBookButton
            label="File sách"
            accept=".pdf,.epub,.mobi"
            buttonText={fileLabel || "Chọn file EPUB/PDF"}
            required={!isEdit}
            onChange={handleFileChange}
            selectedFile={watchedFile instanceof File ? watchedFile : undefined}
            error={form.formState.errors.file?.message as string}
          />

          <div className="space-y-2">
            <Label htmlFor="title">Tên sách</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Ví dụ: Đắc Nhân Tâm"
              onChange={(e) => {
                form.setValue("title", e.target.value);
                if (e.target.value && !isEdit) {
                  form.setValue("slug", generateSlug(e.target.value));
                }
              }}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
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
              readOnly
              disabled
            />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <UploadBookButton
              label="Ảnh bìa"
              accept="image/*"
              buttonText="Chọn ảnh bìa"
              onChange={handleCoverChange}
            />
            {form.formState.errors.cover && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.cover.message}
              </p>
            )}
          </div>
        </div>

        <div className="order-1 flex flex-col border-border md:order-2 md:border-l md:pl-8">
          <Label className="mb-3 block">Xem trước bìa</Label>
          <div className="flex min-h-[200px] flex-1 flex-col items-center justify-start rounded-lg border border-dashed border-border bg-muted/30 p-4">
            {coverPreview ? (
              <ImagePreview
                src={coverPreview}
                alt="Cover preview"
                onRemove={removeCover}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                Chưa có ảnh bìa
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 mt-8 flex justify-end gap-3 border-t border-border bg-background/95 pt-4 backdrop-blur">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

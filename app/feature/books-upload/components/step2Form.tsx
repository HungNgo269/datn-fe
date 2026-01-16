"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AsyncCreatableSelect,
  Option,
} from "@/components/ui/AsyncCreatableSelect";
import {
  BookFormState,
  Step1FormData,
  Step2FormData,
  Step2Schema,
} from "../schema/uploadBookSchema";
import { getAuthorsSearch } from "@/app/feature/author/api/authors.api";
import { getCategorySearch } from "@/app/feature/categories/api/categories.api";
import { useAuthorSubmit } from "../../author/hooks/useAuthorSubmit";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[200px] w-full animate-pulse items-center justify-center rounded-md bg-muted/20 text-sm text-muted-foreground">
      Đang tải trình soạn thảo...
    </div>
  ),
});

interface Step2FormProps {
  step1Data?: Step1FormData;
  defaultValues?: Step2FormData | Partial<BookFormState>;
  authorOptions?: Option[];
  categoryOptions?: Option[];
  onBack: (data: Step2FormData) => void;
  onCancel: () => void;
  onSubmit: (data: Step2FormData) => void;
  isSubmitting: boolean;
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

export function Step2Form({
  step1Data,
  defaultValues,
  authorOptions,
  categoryOptions,
  onBack,
  onCancel,
  onSubmit,
  isSubmitting,
}: Step2FormProps) {
  const step2Defaults: Step2FormData = useMemo(
    () => ({
      authorIds: defaultValues?.authorIds ?? [],
      categoryIds: defaultValues?.categoryIds ?? [],
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? 0,
      freeChapters: defaultValues?.freeChapters ?? 0,
    }),
    [defaultValues]
  );
  const { submitAuthor } = useAuthorSubmit();

  const form = useForm<Step2FormData>({
    resolver: zodResolver(Step2Schema),
    defaultValues: step2Defaults,
  });

  useEffect(() => {
    form.reset(step2Defaults);
  }, [form, step2Defaults]);

  const handleCreateAuthor = useCallback(
    async (inputValue: string): Promise<Option> => {
      try {
        const newAuthor = await submitAuthor({ name: inputValue }, "create");

        if (!newAuthor || !newAuthor.data?.id) {
          throw new Error("Không lấy được ID tác giả mới");
        }

        toast.success(`Đã tạo tác giả: ${inputValue}`);

        return {
          value: newAuthor.data?.id,
          label: newAuthor.data?.name || inputValue,
        };
      } catch (error) {
        toast.error("Lỗi khi tạo tác giả mới");
        throw error;
      }
    },
    [submitAuthor]
  );

  const fetchAuthorOptions = useCallback(async (query: string): Promise<Option[]> => {
    try {
      const response = await getAuthorsSearch({
        page: 1,
        limit: 20,
        q: query,
      });

      const authors = response.data || [];

      return authors.map((author) => ({
        value: author.id,
        label: author.name,
      }));
    } catch {
      return [];
    }
  }, []);

  const fetchCategoryOptions = useCallback(async (query: string): Promise<Option[]> => {
    try {
      const response = await getCategorySearch({
        page: 1,
        limit: 20,
        q: query,
      });

      const categories = response.data || [];

      return categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      }));
    } catch {
      return [];
    }
  }, []);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
        <div className="space-y-1 md:col-span-3">
          <Label>
            Tác giả <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={form.control}
            name="authorIds"
            render={({ field }) => (
              <AsyncCreatableSelect
                label="tác giả"
                placeholder="Tìm hoặc thêm tác giả..."
                value={field.value}
                onChange={field.onChange}
                fetchOptions={fetchAuthorOptions}
                onCreateOption={handleCreateAuthor}
                valueOptions={authorOptions}
                displayMode="inline"
              />
            )}
          />
          <p className="text-[0.8rem] text-muted-foreground">
            Nhập tên tác giả, tìm kiếm. Nếu chưa có, nhấn tạo mới.
          </p>
          {form.formState.errors.authorIds && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.authorIds.message}
            </p>
          )}
        </div>

        <div className="space-y-1 md:col-span-3">
          <Label>
            Thể loại <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <AsyncCreatableSelect
                label="thể loại"
                placeholder="Chọn thể loại..."
                value={field.value}
                onChange={field.onChange}
                fetchOptions={fetchCategoryOptions}
                valueOptions={categoryOptions}
                displayMode="inline"
              />
            )}
          />
          {form.formState.errors.categoryIds && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.categoryIds.message}
            </p>
          )}
        </div>

        <div className="space-y-1 md:col-span-3">
          <Label htmlFor="price">Giá (VND)</Label>
          <div className="relative">
            <Input
              id="price"
              type="number"
              step="1000"
              min="0"
              {...form.register("price", { valueAsNumber: true })}
              placeholder="0"
              className="pr-12"
              disabled={isSubmitting}
            />
            <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
              đ
            </span>
          </div>
          {form.formState.errors.price && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-1 md:col-span-3">
          <Label htmlFor="freeChapters">Số chương miễn phí</Label>
          <Input
            id="freeChapters"
            type="number"
            min="0"
            {...form.register("freeChapters", {
              valueAsNumber: true,
            })}
            placeholder="0"
            disabled={isSubmitting}
          />
          {form.formState.errors.freeChapters && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.freeChapters.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <div className="prose-sm">
              <ReactQuill
                theme="snow"
                value={field.value || ""}
                onChange={field.onChange}
                modules={quillModules}
                readOnly={isSubmitting}
                className="rounded-md bg-background lg:[&_.ql-editor]:min-h-[200px]"
                placeholder="Nhập mô tả sách chi tiết..."
              />
            </div>
          )}
        />
        {form.formState.errors.description && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 z-10 mt-8 flex items-center justify-between border-t border-border bg-background/95 py-4 pt-6 backdrop-blur">
        <Button
          type="button"
          variant="outline"
          onClick={() => onBack(form.getValues())}
          disabled={isSubmitting}
          className="border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại bước 1
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[150px] shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Hoàn tất & Đăng
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

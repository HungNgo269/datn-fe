"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Loader2, Users, Tag, DollarSign, Gift, FileText, X } from "lucide-react";
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
    <div className="flex h-[200px] w-full animate-pulse items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
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
        {/* Author Field */}
        <div className="space-y-1 md:col-span-3">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            Tác giả <span className="text-rose-500">*</span>
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
          <p className="text-xs text-slate-400">
            Nhập tên tác giả, tìm kiếm. Nếu chưa có, nhấn tạo mới.
          </p>
          {form.formState.errors.authorIds && (
            <p className="text-sm text-rose-500 flex items-center gap-1">
              <X className="h-3 w-3" />
              {form.formState.errors.authorIds.message}
            </p>
          )}
        </div>

        {/* Category Field */}
        <div className="space-y-1 md:col-span-3">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400" />
            Thể loại <span className="text-rose-500">*</span>
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
            <p className="text-sm text-rose-500 flex items-center gap-1">
              <X className="h-3 w-3" />
              {form.formState.errors.categoryIds.message}
            </p>
          )}
        </div>

        {/* Price Field */}
        <div className="space-y-1 md:col-span-3">
          <Label htmlFor="price" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            Giá (VND)
          </Label>
          <div className="relative">
            <Input
              id="price"
              type="number"
              step="1000"
              min="0"
              {...form.register("price", { valueAsNumber: true })}
              placeholder="0"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pr-12 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isSubmitting}
            />
            <span className="absolute right-3 top-3 text-sm text-slate-400">
              đ
            </span>
          </div>
          {form.formState.errors.price && (
            <p className="text-sm text-rose-500 flex items-center gap-1">
              <X className="h-3 w-3" />
              {form.formState.errors.price.message}
            </p>
          )}
        </div>

        {/* Free Chapters Field */}
        <div className="space-y-1 md:col-span-3">
          <Label htmlFor="freeChapters" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Gift className="h-4 w-4 text-slate-400" />
            Số chương miễn phí
          </Label>
          <Input
            id="freeChapters"
            type="number"
            min="0"
            {...form.register("freeChapters", {
              valueAsNumber: true,
            })}
            placeholder="0"
            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={isSubmitting}
          />
          {form.formState.errors.freeChapters && (
            <p className="text-sm text-rose-500 flex items-center gap-1">
              <X className="h-3 w-3" />
              {form.formState.errors.freeChapters.message}
            </p>
          )}
        </div>
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          Mô tả
        </Label>
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
                className="rounded-xl border border-slate-200 bg-white [&_.ql-editor]:min-h-[200px] [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-slate-200"
                placeholder="Nhập mô tả sách chi tiết..."
              />
            </div>
          )}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-rose-500 flex items-center gap-1">
            <X className="h-3 w-3" />
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 z-10 mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={() => onBack(form.getValues())}
          disabled={isSubmitting}
          className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại bước 1
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <X className="mr-2 h-4 w-4" />
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-5 min-w-[150px] rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all shadow-md shadow-primary/20"
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

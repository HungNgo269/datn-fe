"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Tag, Link2, FileText, FolderTree, Eye, X, Check } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category } from "../types/listCategories";
import { CategoryFields, CategorySchema } from "@/app/schema/categorySchema";
import { createCategory, updateCategory } from "../api/categories.api";
import { generateSlug } from "@/app/feature/books/helper";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
}

export function CategoryDialog({
  open,
  onOpenChange,
  categoryToEdit,
}: CategoryDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(categoryToEdit);
  type CategoryFormInput = z.input<typeof CategorySchema>;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (categoryToEdit) {
      reset({
        name: categoryToEdit.name,
        slug: categoryToEdit.slug || "",
        description: categoryToEdit.description || "",
        parentId: categoryToEdit.parentId ?? undefined,
        isActive: categoryToEdit.isActive ?? true,
      });
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        parentId: undefined,
        isActive: true,
      });
    }
  }, [open, categoryToEdit, reset]);

  const mutation = useMutation({
    mutationFn: (values: CategoryFields) => {
      const payload = {
        ...values,
        slug: values.slug?.trim() || undefined,
        description: values.description?.trim() || undefined,
        parentId:
          values.parentId && values.parentId > 0 ? values.parentId : undefined,
      };

      if (isEditMode && categoryToEdit) {
        return updateCategory(categoryToEdit.id, payload);
      }
      return createCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(
        isEditMode ? "Cập nhật thành công!" : "Tạo thể loại thành công!"
      );
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    },
  });

  const onSubmit = (data: CategoryFormInput) => {
    const parsedData: CategoryFields = CategorySchema.parse(data);
    mutation.mutate(parsedData);
  };

  const nameField = register("name");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-xl">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              {isEditMode ? "Cập nhật thể loại" : "Thêm thể loại mới"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400" />
              Tên thể loại <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              {...nameField}
              placeholder="Ví dụ: Tiểu thuyết"
              className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.name ? "border-rose-300 bg-rose-50/50" : ""}`}
              onChange={(e) => {
                const value = e.target.value;
                nameField.onChange(e);
                if (!isEditMode) {
                  setValue("slug", generateSlug(value), {
                    shouldValidate: true,
                  });
                }
              }}
            />
            {errors.name && (
              <p className="text-sm text-rose-500 flex items-center gap-1">
                <X className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Slug Field */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-slate-400" />
              Slug
            </Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="ten-danh-muc"
              className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.slug ? "border-rose-300 bg-rose-50/50" : ""}`}
            />
            {errors.slug && (
              <p className="text-sm text-rose-500 flex items-center gap-1">
                <X className="h-3 w-3" />
                {errors.slug.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              Mô tả
            </Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Mô tả ngắn..."
              className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.description ? "border-rose-300 bg-rose-50/50" : ""}`}
            />
            {errors.description && (
              <p className="text-sm text-rose-500 flex items-center gap-1">
                <X className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Parent ID and Status Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentId" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-slate-400" />
                Thể loại cha (ID)
              </Label>
              <Input
                id="parentId"
                type="number"
                min="1"
                {...register("parentId", { valueAsNumber: true })}
                placeholder="Để trống nếu không có"
                className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.parentId ? "border-rose-300 bg-rose-50/50" : ""}`}
              />
              {errors.parentId && (
                <p className="text-sm text-rose-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.parentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-400" />
                Trạng thái
              </Label>
              <div className="flex items-center gap-3 h-11 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 transition-all hover:border-slate-300">
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  )}
                />
                <Label
                  htmlFor="isActive"
                  className="cursor-pointer text-sm text-slate-600 flex-1"
                >
                  Hiển thị thể loại
                </Label>
              </div>
            </div>
          </div>

          {mutation.isError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-center gap-2 text-rose-600">
              <X className="h-4 w-4" />
              <p className="text-sm">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Không thể lưu thể loại. Thử lại sau."}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all shadow-md shadow-primary/20"
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


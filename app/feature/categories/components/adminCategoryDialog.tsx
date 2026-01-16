"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
        isEditMode ? "Cập nhật thành công!" : "Tạo danh mục thành công!"
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
      <DialogContent className="sm:max-w-[560px] rounded-2xl border border-slate-200 bg-white p-6 shadow-none">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {isEditMode ? "Cập nhật danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...nameField}
              placeholder="Ví dụ: Tiểu thuyết"
              className={errors.name ? "border-destructive" : ""}
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
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-slate-700">
              Slug
            </Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="ten-danh-muc"
              className={errors.slug ? "border-destructive" : ""}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Mô tả ngắn..."
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentId">Danh mục cha (ID)</Label>
              <Input
                id="parentId"
                type="number"
                min="1"
                {...register("parentId", { valueAsNumber: true })}
                placeholder="Để trống nếu không có"
                className={errors.parentId ? "border-destructive" : ""}
              />
              {errors.parentId && (
                <p className="text-sm text-destructive">
                  {errors.parentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="isActive"
                  className="cursor-pointer text-sm text-slate-600"
                >
                  Hiển thị danh mục này
                </Label>
              </div>
            </div>
          </div>

          {mutation.isError && (
            <p className="text-right text-sm text-destructive">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Không thể lưu danh mục. Thử lại sau."}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

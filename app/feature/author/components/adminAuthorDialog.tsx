"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthorFields,
  AuthorSchema,
  AuthorSubmitData,
} from "@/app/feature/author/schema/authorSchema";
import { generateSlug } from "../../books/helper";
import { UploadBookButton } from "../../books-upload/components/uploadBookButton";
import { ImagePreview } from "../../books-upload/components/ImagePreview";
import { AuthorInfo } from "../types/authors.types";
import { useAuthorSubmit } from "../hooks/useAuthorSubmit";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[200px] w-full animate-pulse items-center justify-center rounded-md bg-muted/20 text-sm text-muted-foreground">
      Đang tải trình soạn thảo...
    </div>
  ),
});

interface AuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authorToEdit?: AuthorInfo | null;
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

export function AuthorDialog({
  open,
  onOpenChange,
  authorToEdit,
}: AuthorDialogProps) {
  const { submitAuthor } = useAuthorSubmit();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(authorToEdit);

  const form = useForm<AuthorFields>({
    resolver: zodResolver(AuthorSchema),
    defaultValues: {
      name: "",
      slug: "",
      bio: "",
      avatar: undefined,
      isActive: true,
    },
  });

  const avatarValue = form.watch("avatar");
  const filePreviewUrl = useMemo(() => {
    if (avatarValue instanceof File) {
      return URL.createObjectURL(avatarValue);
    }
    return null;
  }, [avatarValue]);
  const resolvedPreview =
    filePreviewUrl ??
    (avatarValue === null
      ? null
      : typeof avatarValue === "string"
        ? avatarValue
        : authorToEdit?.avatar ?? null);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  useEffect(() => {
    if (open) {
      if (authorToEdit) {
        form.reset({
          name: authorToEdit.name,
          slug: authorToEdit.slug,
          bio: authorToEdit.bio || "",
          isActive: authorToEdit.isActive,
          avatar: authorToEdit.avatar || undefined,
        });
      } else {
        form.reset({
          name: "",
          slug: "",
          bio: "",
          avatar: "",
          isActive: true,
        });
      }
    }
  }, [open, authorToEdit, form]);

  const handleAvatarChange = useCallback(
    (file: File) => {
      form.setValue("avatar", file, { shouldValidate: true });
    },
    [form]
  );

  const removeAvatar = useCallback(() => {
    form.setValue("avatar", null, { shouldValidate: true });
  }, [form]);

  const mutation = useMutation({
    mutationFn: async (values: AuthorSubmitData) => {
      const result = await submitAuthor(values, isEditMode ? "edit" : "create");

      if (!result.success) {
        throw new Error(result.error || "Lỗi xử lý");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      toast.success(
        isEditMode ? "Cập nhật thành công!" : "Tạo mới thành công!"
      );
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    },
  });

  const onSubmit = useCallback(
    (formData: AuthorFields) => {
      const submitData: AuthorSubmitData = {
        ...formData,
        id: authorToEdit?.id,
      };

      mutation.mutate(submitData);
    },
    [authorToEdit?.id, mutation]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-none">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {isEditMode ? "Cập nhật tác giả" : "Thêm tác giả mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Tên tác giả <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    onChange={(e) => {
                      form.setValue("name", e.target.value);
                      if (e.target.value && !isEditMode) {
                        form.setValue("slug", generateSlug(e.target.value));
                      }
                    }}
                    placeholder="Nguyễn Nhật Ánh"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-medium text-slate-700">
                    Đường dẫn (Slug) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="slug"
                    readOnly
                    disabled
                    {...form.register("slug")}
                    placeholder="nguyen-nhat-anh"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Tiểu sử / Mô tả</Label>
                <Controller
                  name="bio"
                  control={form.control}
                  render={({ field }) => (
                    <div className="prose-sm max-w-none">
                      <ReactQuill
                        theme="snow"
                        value={field.value}
                        onChange={field.onChange}
                        modules={quillModules}
                        className="rounded-md border border-slate-200 bg-white [&_.ql-editor]:min-h-[250px]"
                        placeholder="Nhập tiểu sử tác giả..."
                      />
                    </div>
                  )}
                />
                {form.formState.errors.bio && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-6 border-border md:border-l md:pl-6">
              <div className="space-y-3">
                <Label className="block text-sm font-medium text-slate-700">
                  Ảnh đại diện <span className="text-destructive">*</span>
                </Label>

                <div className="group relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100">
                  {resolvedPreview ? (
                    <ImagePreview
                      src={resolvedPreview}
                      alt="Author avatar"
                      onRemove={removeAvatar}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center text-muted-foreground">
                      <div className="rounded-full border border-slate-200 bg-white p-3">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium">Chưa có ảnh</span>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <UploadBookButton
                    label=""
                    accept="image/*"
                    buttonText={resolvedPreview ? "Thay đổi ảnh" : "Tải ảnh lên"}
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    control={form.control}
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
                    className="cursor-pointer text-sm font-normal text-slate-600"
                  >
                    Hiển thị công khai tác giả này
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? "Lưu thay đổi" : "Tạo tác giả"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

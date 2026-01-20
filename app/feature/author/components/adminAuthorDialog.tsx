"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2, User, Link2, FileText, Eye, X, Check } from "lucide-react";
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
import { ImagePreview } from "../../books-upload/components/ImagePreview";
import { AuthorInfo } from "../types/authors.types";
import { useAuthorSubmit } from "../hooks/useAuthorSubmit";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[200px] w-full animate-pulse items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-xl">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              {isEditMode ? "Cập nhật tác giả" : "Thêm tác giả mới"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px]">
            {/* Left Column - Form Fields */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    Tên tác giả <span className="text-rose-500">*</span>
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
                    className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${form.formState.errors.name ? "border-rose-300 bg-rose-50/50" : ""}`}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-rose-500 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Slug Field */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-slate-400" />
                    Đường dẫn (Slug) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="slug"
                    readOnly
                    disabled
                    {...form.register("slug")}
                    placeholder="nguyen-nhat-anh"
                    className="h-11 rounded-xl border-slate-200 bg-slate-100/50 text-slate-500"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-rose-500 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Tiểu sử / Mô tả
                </Label>
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
                        className="rounded-xl border border-slate-200 bg-white [&_.ql-editor]:min-h-[200px] [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-slate-200"
                        placeholder="Nhập tiểu sử tác giả..."
                      />
                    </div>
                  )}
                />
                {form.formState.errors.bio && (
                  <p className="text-sm text-rose-500 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Avatar & Status */}
            <div className="flex flex-col space-y-5 md:border-l md:border-slate-100 md:pl-6">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-slate-400" />
                  Ảnh đại diện <span className="text-rose-500">*</span>
                </Label>

                <div className="group relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white transition-all hover:border-primary/50 hover:bg-primary/5">
                  {resolvedPreview ? (
                    <>
                      <ImagePreview
                        src={resolvedPreview}
                        alt="Author avatar"
                        onRemove={removeAvatar}
                      />
                      {/* Replace avatar button */}
                      <button
                        type="button"
                        onClick={() => document.getElementById('author-avatar-input')?.click()}
                        className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-110"
                      >
                        <ImagePlus className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <div 
                      className="flex flex-col items-center justify-center space-y-3 p-4 text-center cursor-pointer h-full w-full" 
                      onClick={() => document.getElementById('author-avatar-input')?.click()}
                    >
                      <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-4 transition-transform group-hover:scale-110">
                        <ImagePlus className="h-8 w-8 text-primary/60" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Nhấn để chọn ảnh</span>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG tối đa 5MB</p>
                      </div>
                    </div>
                  )}
                  {/* Hidden file input */}
                  <input
                    id="author-avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarChange(file);
                    }}
                    className="hidden"
                  />
                </div>

                {form.formState.errors.avatar && (
                  <p className="text-sm text-rose-500 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {form.formState.errors.avatar.message}
                  </p>
                )}
              </div>

              {/* Status Toggle */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 transition-all hover:border-slate-300">
                <div className="flex items-center space-x-3">
                  <Controller
                    control={form.control}
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
                  <div className="flex-1">
                    <Label
                      htmlFor="isActive"
                      className="cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4 text-slate-400" />
                      Hiển thị công khai
                    </Label>
                    <p className="text-xs text-slate-400 mt-0.5">Tác giả sẽ hiển thị trên trang web</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="border-t border-slate-100 pt-4 gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Hủy bỏ
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
              {isEditMode ? "Lưu thay đổi" : "Tạo tác giả"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


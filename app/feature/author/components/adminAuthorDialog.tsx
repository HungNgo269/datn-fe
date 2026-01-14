"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ImagePlus, X } from "lucide-react"; // Thêm icon

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AuthorFields,
  AuthorSchema,
  AuthorSubmitData,
} from "@/app/feature/author/schema/authorSchema";
import { generateSlug } from "../../books/helper";
import { UploadBookButton } from "../../books-upload/components/uploadBookButton";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { ImagePreview } from "../../books-upload/components/ImagePreview";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthorInfo } from "../types/authors.types";
import { useAuthorSubmit } from "../hooks/useAuthorSubmit";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] w-full bg-muted/20 animate-pulse rounded-md flex items-center justify-center text-muted-foreground text-sm">
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
  const isEditMode = !!authorToEdit;

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
    (typeof avatarValue === "string"
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

  const handleAvatarChange = (file: File) => {
    form.setValue("avatar", file, { shouldValidate: true });
  };

  const removeAvatar = () => {
    form.setValue("avatar", undefined);
  };
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
  const onSubmit = (formData: AuthorFields) => {
    const submitData: AuthorSubmitData = {
      ...formData,
      id: authorToEdit?.id,
    };

    mutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Cập Nhật Tác Giả" : "Thêm Tác Giả Mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
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
                    <p className="text-sm text-destructive font-medium">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">
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
                    <p className="text-sm text-destructive font-medium">
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
                        className="bg-background rounded-md [&_.ql-editor]:min-h-[250px]"
                        placeholder="Nhập tiểu sử tác giả..."
                      />
                    </div>
                  )}
                />
                {form.formState.errors.bio && (
                  <p className="text-sm text-destructive font-medium">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 md:border-l md:pl-6 border-border flex flex-col">
              <div className="space-y-3">
                <Label className="block">
                  Ảnh đại diện<span className="text-destructive">*</span>
                </Label>

                <div className="relative group w-full aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 overflow-hidden flex flex-col items-center justify-center hover:bg-muted/50 transition-colors">
                  {resolvedPreview ? (
                    <>
                      <ImagePreview
                        src={resolvedPreview}
                        alt="Author Avatar"
                        onRemove={removeAvatar}
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute top-2 right-2 p-1 bg-destructive/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 text-muted-foreground">
                      <div className="p-3 bg-background rounded-full shadow-sm">
                        <ImagePlus className="w-6 h-6" />
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

              <div className="pt-4 border-t border-border">
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
                    className="cursor-pointer font-normal"
                  >
                    Hiển thị công khai tác giả này
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t mt-4">
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

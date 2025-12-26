"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { ImagePreview } from "../../books-upload/components/ImagePreview";
import { UploadBookButton } from "../../books-upload/components/uploadBookButton";
import { Banner, BannerPosition } from "../types/banner.types";
import { useBannerSubmit } from "../hooks/useSubmitBanner";
import { BannerFormValues, BannerSchema } from "../schema/banner.schema";
import { formatDate } from "@/lib/formatDate";

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bannerToEdit?: Banner | null;
}

export function BannerDialog({
  open,
  onOpenChange,
  bannerToEdit,
}: BannerDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { submitBanner } = useBannerSubmit();

  const queryClient = useQueryClient();
  const isEditMode = !!bannerToEdit;

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(BannerSchema),
    defaultValues: {
      title: "",
      description: "",
      linkUrl: "",
      position: BannerPosition.HOME_SLIDER,
      startDate: "",
      endDate: "",
      order: 0,
      imageUrl: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (bannerToEdit) {
        form.reset({
          title: bannerToEdit.title,
          description: bannerToEdit.description ?? "",
          linkUrl: bannerToEdit.linkUrl ?? "",
          position: bannerToEdit.position,
          startDate: bannerToEdit.startDate
            ? formatDate(bannerToEdit.startDate)
            : "",
          endDate: bannerToEdit.endDate ? formatDate(bannerToEdit.endDate) : "",
          order: bannerToEdit.order,
          isActive: bannerToEdit.isActive,
          imageUrl: bannerToEdit.imageUrl,
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImagePreview(bannerToEdit.imageUrl);
      } else {
        form.reset({
          title: "",
          description: "",
          linkUrl: "",
          position: BannerPosition.HOME_SLIDER,
          startDate: "",
          endDate: "",
          order: 0,
          isActive: true,
          imageUrl: undefined,
        });
        setImagePreview(null);
      }
    }
  }, [open, bannerToEdit, form]);

  const handleImageChange = (file: File) => {
    form.setValue("imageUrl", file, { shouldValidate: true });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    form.setValue("imageUrl", "" as string | File);
    setImagePreview(null);
  };

  const mutation = useMutation({
    mutationFn: async (values: BannerFormValues) => {
      const result = await submitBanner(
        values,
        isEditMode ? "edit" : "create",
        bannerToEdit?.id
      );

      if (!result.success) {
        throw new Error(result.error || "Lỗi xử lý");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success(
        isEditMode
          ? "Cập nhật banner thành công!"
          : "Tạo banner mới thành công!"
      );
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    },
  });

  const onSubmit: SubmitHandler<BannerFormValues> = (formData) => {
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Cập Nhật Banner" : "Thêm Banner Mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Tiêu đề <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Nhập tiêu đề banner"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive font-medium">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">
                    Vị trí hiển thị <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(BannerPosition).map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.position && (
                    <p className="text-sm text-destructive font-medium">
                      {form.formState.errors.position.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkUrl">Đường dẫn (URL)</Label>
                <Input
                  id="linkUrl"
                  {...form.register("linkUrl")}
                  placeholder="https://example.com/khuyen-mai"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả ngắn</Label>
                <Textarea
                  id="description"
                  className="min-h-[100px]"
                  {...form.register("description")}
                  placeholder="Nhập mô tả cho banner..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    type="date"
                    id="startDate"
                    {...form.register("startDate")}
                  />
                  {form.formState.errors.startDate && (
                    <p className="text-sm text-destructive font-medium">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    type="date"
                    id="endDate"
                    {...form.register("endDate")}
                  />
                  {form.formState.errors.endDate && (
                    <p className="text-sm text-destructive font-medium">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Thứ tự ưu tiên</Label>
                  <Input
                    type="number"
                    id="order"
                    min="0"
                    {...form.register("order", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 md:border-l md:pl-6 border-border flex flex-col">
              <div className="space-y-3">
                <Label className="block">
                  Hình ảnh Banner<span className="text-destructive">*</span>
                </Label>

                <div className="relative group w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 overflow-hidden flex flex-col items-center justify-center hover:bg-muted/50 transition-colors">
                  {imagePreview ? (
                    <>
                      <ImagePreview
                        src={imagePreview}
                        alt="Banner Image"
                        onRemove={removeImage}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
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
                    buttonText={imagePreview ? "Thay đổi ảnh" : "Tải ảnh lên"}
                    onChange={handleImageChange}
                  />
                </div>
                {form.formState.errors.imageUrl && (
                  <p className="text-sm text-destructive font-medium text-center">
                    {typeof form.formState.errors.imageUrl.message === "string"
                      ? form.formState.errors.imageUrl.message
                      : "Vui lòng chọn ảnh"}
                  </p>
                )}
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
                    Kích hoạt hiển thị ngay
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
              {isEditMode ? "Lưu thay đổi" : "Tạo Banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

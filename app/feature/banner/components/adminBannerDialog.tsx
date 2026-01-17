"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2, Image, Type, Link2, FileText, Calendar, Hash, Eye, X, Check } from "lucide-react";
import { z } from "zod";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImagePreview } from "../../books-upload/components/ImagePreview";
import { Banner, BannerPosition } from "../types/banner.types";
import { useBannerSubmit } from "../hooks/useSubmitBanner";
import { BannerFormValues, BannerSchema } from "../schema/banner.schema";
import { formatISODateInput } from "@/lib/formatDateInput";

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
  const { submitBanner } = useBannerSubmit();

  const queryClient = useQueryClient();
  const isEditMode = Boolean(bannerToEdit);

  type BannerFormInput = z.input<typeof BannerSchema>;
  const form = useForm<BannerFormInput>({
    resolver: zodResolver(BannerSchema),
    defaultValues: {
      title: "",
      description: "",
      linkUrl: "",
      position: BannerPosition.HOME_SLIDER,
      startDate: "",
      endDate: "",
      order: undefined,
      imageUrl: "",
      isActive: true,
    },
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const imageValue = form.watch("imageUrl");
  const filePreviewUrl = useMemo(() => {
    if (imageValue instanceof File) {
      return URL.createObjectURL(imageValue);
    }
    return null;
  }, [imageValue]);
  const resolvedPreview =
    filePreviewUrl ??
    (typeof imageValue === "string"
      ? imageValue
      : bannerToEdit?.imageUrl ?? null);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  useEffect(() => {
    if (open) {
      if (bannerToEdit) {
        form.reset({
          title: bannerToEdit.title,
          description: bannerToEdit.description ?? "",
          linkUrl: bannerToEdit.linkUrl ?? "",
          position: bannerToEdit.position,
          startDate: formatISODateInput(bannerToEdit.startDate),
          endDate: formatISODateInput(bannerToEdit.endDate),
          order: bannerToEdit.order ?? undefined,
          isActive: bannerToEdit.isActive,
          imageUrl: bannerToEdit.imageUrl ?? "",
        });
      } else {
        form.reset({
          title: "",
          description: "",
          linkUrl: "",
          position: BannerPosition.HOME_SLIDER,
          startDate: "",
          endDate: "",
          order: undefined,
          isActive: true,
          imageUrl: "",
        });
      }
    }
  }, [open, bannerToEdit, form]);

  const handleImageChange = useCallback(
    (file: File) => {
      form.setValue("imageUrl", file, { shouldValidate: true });
    },
    [form]
  );

  const removeImage = useCallback(() => {
    form.setValue("imageUrl", "", { shouldValidate: true });
  }, [form]);

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
        isEditMode ? "Cập nhật banner thành công!" : "Tạo banner mới thành công!"
      );
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    },
  });

  const onSubmit: SubmitHandler<BannerFormInput> = useCallback(
    (formData) => {
      const parsedData: BannerFormValues = BannerSchema.parse(formData);
      mutation.mutate(parsedData);
    },
    [mutation]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-xl">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Image className="h-5 w-5 text-primary" />
              </div>
              {isEditMode ? "Cập nhật Banner" : "Thêm Banner mới"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px]">
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Type className="h-4 w-4 text-slate-400" />
                    Tiêu đề <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Nhập tiêu đề banner"
                    className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.title ? "border-rose-300 bg-rose-50/50" : ""}`}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-rose-500 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                {/* Position Field */}
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-slate-400" />
                    Vị trí hiển thị <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="position"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-primary/20">
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
                    <p className="text-sm text-rose-500 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {form.formState.errors.position.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Link URL Field */}
              <div className="space-y-2">
                <Label htmlFor="linkUrl" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-slate-400" />
                  Đường dẫn (URL)
                </Label>
                <Input
                  id="linkUrl"
                  {...register("linkUrl")}
                  placeholder="https://example.com/khuyen-mai"
                  className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.linkUrl ? "border-rose-300 bg-rose-50/50" : ""}`}
                />
                {errors.linkUrl && (
                  <p className="text-sm text-rose-500 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.linkUrl.message}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Mô tả ngắn
                </Label>
                <Textarea
                  id="description"
                  className="min-h-[100px] rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  {...register("description")}
                  placeholder="Nhập mô tả cho banner..."
                />
                {errors.description && (
                  <p className="text-sm text-rose-500 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Date and Order Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Ngày bắt đầu
                  </Label>
                  <Input
                    type="date"
                    id="startDate"
                    {...register("startDate")}
                    className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.startDate ? "border-rose-300 bg-rose-50/50" : ""}`}
                  />
                  {form.formState.errors.startDate && (
                    <p className="text-sm text-rose-500 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Ngày kết thúc
                  </Label>
                  <Input
                    type="date"
                    id="endDate"
                    {...register("endDate")}
                    className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.endDate ? "border-rose-300 bg-rose-50/50" : ""}`}
                  />
                  {form.formState.errors.endDate && (
                    <p className="text-sm text-rose-500 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-slate-400" />
                    Thứ tự ưu tiên
                  </Label>
                  <Input
                    type="number"
                    id="order"
                    min="0"
                    {...register("order")}
                    className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.order ? "border-rose-300 bg-rose-50/50" : ""}`}
                  />
                  {errors.order && (
                    <p className="text-sm text-rose-500 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.order.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="flex flex-col space-y-5 md:border-l md:border-slate-100 md:pl-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-slate-400" />
                  Hình ảnh Banner <span className="text-rose-500">*</span>
                </Label>

                <div className="group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white transition-all hover:border-primary/50 hover:bg-primary/5">
                  {resolvedPreview ? (
                    <>
                      <ImagePreview
                        src={resolvedPreview}
                        alt="Banner image"
                        onRemove={removeImage}
                      />
                      {/* Replace banner button */}
                      <button
                        type="button"
                        onClick={() => document.getElementById('banner-image-input')?.click()}
                        className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-110"
                      >
                        <ImagePlus className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <div 
                      className="flex flex-col items-center justify-center space-y-3 p-4 text-center cursor-pointer h-full w-full" 
                      onClick={() => document.getElementById('banner-image-input')?.click()}
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
                    id="banner-image-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageChange(file);
                    }}
                    className="hidden"
                  />
                </div>
                {form.formState.errors.imageUrl && (
                  <p className="text-center text-sm text-rose-500 flex items-center justify-center gap-1">
                    <X className="h-3 w-3" />
                    {typeof form.formState.errors.imageUrl.message === "string"
                      ? form.formState.errors.imageUrl.message
                      : "Vui lòng chọn ảnh"}
                  </p>
                )}
              </div>

              {/* Status Toggle */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 transition-all hover:border-slate-300">
                <div className="flex items-center space-x-3">
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
                  <div className="flex-1">
                    <Label
                      htmlFor="isActive"
                      className="cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4 text-slate-400" />
                      Kích hoạt hiển thị
                    </Label>
                    <p className="text-xs text-slate-400 mt-0.5">Banner sẽ hiển thị ngay lập tức</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {mutation.isError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-center gap-2 text-rose-600">
              <X className="h-4 w-4" />
              <p className="text-sm">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Không thể lưu banner. Thử lại sau."}
              </p>
            </div>
          )}

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
              {isEditMode ? "Lưu thay đổi" : "Tạo Banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


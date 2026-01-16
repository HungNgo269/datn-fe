"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";
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
import { UploadBookButton } from "../../books-upload/components/uploadBookButton";
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-none">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {isEditMode ? "Cập nhật Banner" : "Thêm Banner mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                    Tiêu đề <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Nhập tiêu đề banner"
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium text-slate-700">
                    Vị trí hiển thị <span className="text-destructive">*</span>
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
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.position.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkUrl">Đường dẫn (URL)</Label>
                <Input
                  id="linkUrl"
                  {...register("linkUrl")}
                  placeholder="https://example.com/khuyen-mai"
                  className={errors.linkUrl ? "border-destructive" : ""}
                />
                {errors.linkUrl && (
                  <p className="text-sm text-destructive">
                    {errors.linkUrl.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả ngắn</Label>
                <Textarea
                  id="description"
                  className="min-h-[100px] border-slate-200 bg-white focus-visible:ring-slate-300"
                  {...register("description")}
                  placeholder="Nhập mô tả cho banner..."
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    type="date"
                    id="startDate"
                    {...register("startDate")}
                    className={errors.startDate ? "border-destructive" : ""}
                  />
                  {form.formState.errors.startDate && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    type="date"
                    id="endDate"
                    {...register("endDate")}
                    className={errors.endDate ? "border-destructive" : ""}
                  />
                  {form.formState.errors.endDate && (
                    <p className="text-sm font-medium text-destructive">
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
                    {...register("order")}
                    className={errors.order ? "border-destructive" : ""}
                  />
                  {errors.order && (
                    <p className="text-sm text-destructive">
                      {errors.order.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-6 border-border md:border-l md:pl-6">
              <div className="space-y-3">
                <Label className="block text-sm font-medium text-slate-700">
                  Hình ảnh Banner<span className="text-destructive">*</span>
                </Label>

                <div className="group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100">
                  {resolvedPreview ? (
                    <ImagePreview
                      src={resolvedPreview}
                      alt="Banner image"
                      onRemove={removeImage}
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
                    onChange={handleImageChange}
                  />
                </div>
                {form.formState.errors.imageUrl && (
                  <p className="text-center text-sm font-medium text-destructive">
                    {typeof form.formState.errors.imageUrl.message === "string"
                      ? form.formState.errors.imageUrl.message
                      : "Vui lòng chọn ảnh"}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center space-x-2">
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
                    className="cursor-pointer text-sm font-normal text-slate-600"
                  >
                    Kích hoạt hiển thị ngay
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
              {isEditMode ? "Lưu thay đổi" : "Tạo Banner"}
            </Button>
          </DialogFooter>

          {mutation.isError && (
            <p className="text-right text-sm text-destructive">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Không thể lưu banner. Thử lại sau."}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

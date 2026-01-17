"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  DollarSign,
  FileText,
  Eye,
  X,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plan, SubscriptionPlan, BillingInterval } from "../types/plans.types";
import { PlanFields, PlanSchema } from "@/app/schema/planSchema";
import { createPlan, updatePlan } from "../api/plans.api";

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planToEdit?: Plan | null;
}

export function PlanDialog({
  open,
  onOpenChange,
  planToEdit,
}: PlanDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(planToEdit);
  type PlanFormInput = z.input<typeof PlanSchema>;

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<PlanFormInput>({
    resolver: zodResolver(PlanSchema),
    defaultValues: {
      plan: SubscriptionPlan.PREMIUM,
      name: "",
      description: "",
      price: 0,
      currency: "vnd",
      interval: BillingInterval.MONTH,
      intervalCount: 1,
      features: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (planToEdit) {
      reset({
        plan: planToEdit.plan,
        name: planToEdit.name,
        description: planToEdit.description || "",
        price: planToEdit.price,
        currency: planToEdit.currency || "vnd",
        interval: planToEdit.interval,
        intervalCount: planToEdit.intervalCount || 1,
        isActive: planToEdit.isActive ?? true,
      });
      setFeatures(planToEdit.features || []);
    } else {
      reset({
        plan: SubscriptionPlan.PREMIUM,
        name: "",
        description: "",
        price: 0,
        currency: "vnd",
        interval: BillingInterval.MONTH,
        intervalCount: 1,
        isActive: true,
      });
      setFeatures([]);
    }
  }, [open, planToEdit, reset]);

  const mutation = useMutation({
    mutationFn: (values: PlanFields) => {
      const payload = {
        ...values,
        features: features.length > 0 ? features : undefined,
      };

      if (isEditMode && planToEdit) {
        return updatePlan(planToEdit.id, payload);
      }
      return createPlan(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success(
        isEditMode ? "Cập nhật gói thành công!" : "Tạo gói thành công!"
      );
      onOpenChange(false);
    },
    onError: (error: any) => {
      // Error message is already parsed by handleApiRequest
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Có lỗi xảy ra";
      
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: PlanFormInput) => {
    const parsedData: PlanFields = PlanSchema.parse(data);
    mutation.mutate(parsedData);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              {isEditMode ? "Cập nhật gói hội viên" : "Thêm gói hội viên mới"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-5">
          {/* Plan Type and Name Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                Loại gói <span className="text-rose-500">*</span>
              </Label>
              <Controller
                control={control}
                name="plan"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 ${errors.plan ? "border-rose-300 bg-rose-50/50" : ""}`}>
                      <SelectValue placeholder="Chọn loại gói" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SubscriptionPlan.BASIC}>BASIC</SelectItem>
                      <SelectItem value={SubscriptionPlan.PREMIUM}>PREMIUM</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.plan && (
                <p className="text-sm text-rose-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.plan.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                Tên gói <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ví dụ: Gói Premium"
                className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.name ? "border-rose-300 bg-rose-50/50" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-rose-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.name.message}
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
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Mô tả về gói hội viên..."
              className={`min-h-[80px] rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.description ? "border-rose-300 bg-rose-50/50" : ""}`}
            />
            {errors.description && (
              <p className="text-sm text-rose-500 flex items-center gap-1">
                <X className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price and Currency Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-400" />
                Giá <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                {...register("price", { valueAsNumber: true })}
                placeholder="99000"
                className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.price ? "border-rose-300 bg-rose-50/50" : ""}`}
              />
              {errors.price && (
                <p className="text-sm text-rose-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium text-slate-700">
                Đơn vị
              </Label>
              <Input
                id="currency"
                {...register("currency")}
                placeholder="vnd"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Interval and Interval Count Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interval" className="text-sm font-medium text-slate-700">
                Chu kỳ
              </Label>
              <Controller
                control={control}
                name="interval"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50">
                      <SelectValue placeholder="Chọn chu kỳ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BillingInterval.MONTH}>Tháng</SelectItem>
                      <SelectItem value={BillingInterval.YEAR}>Năm</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intervalCount" className="text-sm font-medium text-slate-700">
                Thời hạn
              </Label>
              <Controller
                control={control}
                name="intervalCount"
                render={({ field }) => (
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50">
                      <SelectValue placeholder="Chọn thời hạn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-slate-500">
                Kết hợp với chu kỳ (VD: 3 tháng, 1 năm)
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Tính năng
            </Label>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="flex-1 text-sm text-slate-700">{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(index)}
                    className="h-7 w-7 hover:bg-rose-100 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="Thêm tính năng mới..."
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50"
                />
                <Button
                  type="button"
                  onClick={addFeature}
                  variant="outline"
                  className="h-11 px-4 rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Status */}
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
                Kích hoạt gói này
              </Label>
            </div>
          </div>

          {mutation.isError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-2">
              <div className="flex items-start gap-2 text-rose-600">
                <X className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Lỗi khi lưu gói hội viên</p>
                  <p className="text-sm mt-1">
                    {mutation.error instanceof Error
                      ? mutation.error.message
                      : "Không thể lưu gói. Vui lòng kiểm tra lại thông tin và thử lại."}
                  </p>
                </div>
              </div>
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

"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Percent, Minus, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlanSelectionTable } from "@/app/feature/promotions/components/planSelectionTable";
import { createPlanPromotion } from "@/app/feature/promotions/api/promotions.api";
import type { CreatePlanPromotionDto, PromotionType, PromotionDuration } from "@/app/feature/promotions/types/promotions.types";

export default function CreatePlanPromotionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PromotionType>("PERCENTAGE");
  const [value, setValue] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState<number>(0);
  const [applyToAllPlans, setApplyToAllPlans] = useState(false);
  const [duration, setDuration] = useState<PromotionDuration>("ONCE");
  const [durationInMonths, setDurationInMonths] = useState<number | undefined>(undefined);
  const [maxDiscountValue, setMaxDiscountValue] = useState<number | undefined>(undefined);

  const createMutation = useMutation({
    mutationFn: createPlanPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Tạo khuyến mãi gói hội viên thành công");
      router.push("/promotions-admin/plans");
    },
    onError: (error: any) => {
      console.error("Creation error:", error);
      const message = error?.response?.data?.message || (error instanceof Error ? error.message : "Tạo khuyến mãi thất bại");
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    },
  });

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên khuyến mãi");
      return;
    }
    if (!applyToAllPlans && selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một gói hội viên hoặc áp dụng cho tất cả");
      return;
    }
    if (value <= 0) {
      toast.error("Giá trị giảm phải lớn hơn 0");
      return;
    }
    if (type === "PERCENTAGE" && value > 100) {
      toast.error("Phần trăm giảm không được vượt quá 100%");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn thời gian áp dụng");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }
    if (duration === "REPEATING" && (!durationInMonths || durationInMonths < 1)) {
      toast.error("Vui lòng nhập số tháng lặp lại hợp lệ");
      return;
    }

    const dto: CreatePlanPromotionDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      scope: "SUBSCRIPTION",
      type,
      value,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      priority,
      duration,
      durationInMonths: duration === "REPEATING" ? durationInMonths : undefined,
      applyToAllPlans,
      planIds: applyToAllPlans ? undefined : selectedIds,
      maxDiscountValue: type === "PERCENTAGE" && maxDiscountValue ? maxDiscountValue : undefined,
    };

    createMutation.mutate(dto);
  }, [
    name,
    description,
    type,
    value,
    selectedIds,
    startDate,
    endDate,
    priority,
    applyToAllPlans,
    duration,
    durationInMonths,
    maxDiscountValue,
    createMutation,
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 relative overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/promotions-admin/plans">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Tạo khuyến mãi gói hội viên mới
            </h1>
            <p className="text-slate-600">
              Điền thông tin để tạo chương trình khuyến mãi cho gói hội viên
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-8">
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Tên khuyến mãi *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Flash Sale Hội Viên"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Loại giảm giá *</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as PromotionType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Phần trăm (%)
                      </div>
                    </SelectItem>
                    <SelectItem value="FIXED_AMOUNT">
                      <div className="flex items-center gap-2">
                        <Minus className="w-4 h-4" />
                        Số tiền cố định (₫)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="value">
                  Giá trị giảm {type === "PERCENTAGE" ? "(%)" : "(₫)"} *
                </Label>
                <Input
                  id="value"
                  type="number"
                  min={0}
                  max={type === "PERCENTAGE" ? 100 : undefined}
                  value={value || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setValue(isNaN(val) ? 0 : val);
                  }}
                  placeholder={type === "PERCENTAGE" ? "VD: 20" : "VD: 50000"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Input
                  id="priority"
                  type="number"
                  min={0}
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  placeholder="VD: 0"
                />
                <p className="text-xs text-slate-500">Số cao hơn = ưu tiên cao hơn</p>
              </div>
            </div>

            {/* Duration settings for subscription */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Thời gian áp dụng giảm giá</Label>
                <Select
                  value={duration}
                  onValueChange={(v) => setDuration(v as PromotionDuration)}
                >
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONCE">Một lần (kỳ đầu tiên)</SelectItem>
                    <SelectItem value="REPEATING">Lặp lại (nhiều kỳ)</SelectItem>
                    <SelectItem value="FOREVER">Mãi mãi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {duration === "REPEATING" && (
                <div className="space-y-2">
                  <Label htmlFor="durationInMonths">Số tháng lặp lại *</Label>
                  <Input
                    id="durationInMonths"
                    type="number"
                    min={1}
                    value={durationInMonths || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setDurationInMonths(isNaN(val) ? undefined : val);
                    }}
                    placeholder="VD: 3"
                  />
                </div>
              )}
            </div>

            {/* Max discount for percentage */}
            {type === "PERCENTAGE" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountValue">Giảm tối đa (₫)</Label>
                  <Input
                    id="maxDiscountValue"
                    type="number"
                    min={0}
                    value={maxDiscountValue || ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setMaxDiscountValue(isNaN(val) ? undefined : val);
                    }}
                    placeholder="VD: 100000 (để trống = không giới hạn)"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết..."
                rows={3}
              />
            </div>
          </section>

          {/* Time & Scope */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
              Thời gian & Phạm vi áp dụng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 bg-slate-50/50">
              <div className="space-y-0.5">
                <Label>Áp dụng cho tất cả gói</Label>
                <p className="text-sm text-slate-500">
                  Bật để áp dụng khuyến mãi cho toàn bộ gói hội viên
                </p>
              </div>
              <Switch
                checked={applyToAllPlans}
                onCheckedChange={setApplyToAllPlans}
              />
            </div>

            {!applyToAllPlans && (
              <div className="space-y-3">
                <Label>Chọn gói hội viên áp dụng *</Label>
                <div className="rounded-lg border border-slate-200">
                  <PlanSelectionTable
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-8">
            <Link href="/promotions-admin/plans">
              <Button
                variant="outline"
                className="min-w-[100px]"
                disabled={createMutation.isPending}
              >
                Hủy
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="min-w-[140px]"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo khuyến mãi"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Loader2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getPlans } from "@/app/feature/plans/api/plans.api";

interface PlanSelectionTableProps {
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

function _PlanSelectionTable({
  selectedIds,
  onSelectionChange,
}: PlanSelectionTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["promotion-plans", page],
    queryFn: () => getPlans({ page, limit: pageSize }),
  });

  const plans = data?.data ?? [];
  const meta = data?.meta ?? null;

  const isAllSelected = useMemo(() => {
    if (plans.length === 0) return false;
    return plans.every((plan) => selectedIds.includes(plan.id));
  }, [plans, selectedIds]);

  const isSomeSelected = useMemo(() => {
    if (plans.length === 0) return false;
    return plans.some((plan) => selectedIds.includes(plan.id)) && !isAllSelected;
  }, [plans, selectedIds, isAllSelected]);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      const currentPageIds = plans.map((plan) => plan.id);
      onSelectionChange(selectedIds.filter((id) => !currentPageIds.includes(id)));
    } else {
      const currentPageIds = plans.map((plan) => plan.id);
      const newSelected = [...selectedIds];
      currentPageIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onSelectionChange(newSelected);
    }
  }, [plans, selectedIds, isAllSelected, onSelectionChange]);

  const handleSelectOne = useCallback(
    (id: number) => {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    },
    [selectedIds, onSelectionChange]
  );

  const formatPrice = (price: number, currency: string) => {
    if (currency.toLowerCase() === "vnd") {
      return `${price.toLocaleString("vi-VN")}₫`;
    }
    return `${price} ${currency.toUpperCase()}`;
  };

  const formatInterval = (interval: string, intervalCount: number) => {
    const unit = interval === "MONTH" ? "Tháng" : "Năm";
    return `${intervalCount} ${unit}`;
  };

  return (
    <div className="space-y-4">
      {/* Selection summary */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Check className="h-4 w-4" />
          <span>
            Đã chọn <strong>{selectedIds.length}</strong> gói hội viên
          </span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
              </TableHead>
              <TableHead className="text-slate-700">Tên gói</TableHead>
              <TableHead className="text-slate-700">Chu kỳ</TableHead>
              <TableHead className="text-right text-slate-700">Giá gốc</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32">
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin text-slate-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  Không tìm thấy gói hội viên nào
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow
                  key={plan.id}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    selectedIds.includes(plan.id) ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleSelectOne(plan.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(plan.id)}
                      onCheckedChange={() => handleSelectOne(plan.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {plan.name}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatInterval(plan.interval, plan.intervalCount)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-600">
                    {formatPrice(plan.price, plan.currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Inline Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600">
            Trang {page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
export const PlanSelectionTable = memo(_PlanSelectionTable);

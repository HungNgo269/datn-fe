"use client";

import { useState } from "react";
import { Loader2, MoreVertical, Percent, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Promotion } from "../types/promotions.types";
import { formatDate } from "@/lib/formatDate";

interface AdminPromotionListProps {
  promotions: Promotion[];
  onEdit?: (promotion: Promotion) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  isFetching?: boolean;
}

export function AdminPromotionList({
  promotions,
  onEdit,
  onDelete,
  isDeleting,
  isFetching,
}: AdminPromotionListProps) {
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);

  const formatDiscount = (promotion: Promotion) => {
    if (promotion.type === "PERCENTAGE") {
      return `${promotion.value}%`;
    }
    return `${Number(promotion.value).toLocaleString("vi-VN")}₫`;
  };

  const getScopeLabel = (scope: string) => {
    return scope === "BOOK" ? "Sách" : "Gói hội viên";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-[0_1px_1px_rgba(0,0,0,0.04)] overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="text-slate-700">Tên khuyến mãi</TableHead>
            <TableHead className="text-slate-700">Loại giảm giá</TableHead>
            <TableHead className="text-center text-slate-700">Giá trị</TableHead>
            <TableHead className="text-center text-slate-700">Áp dụng cho</TableHead>
            <TableHead className="text-center text-slate-700">Ưu tiên</TableHead>
            <TableHead className="text-center text-slate-700">Thời gian</TableHead>
            <TableHead className="text-center text-slate-700">Trạng thái</TableHead>
            <TableHead className="text-right text-slate-700"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetching ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24">
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin text-slate-500" />
                </div>
              </TableCell>
            </TableRow>
          ) : promotions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Không có khuyến mãi nào
              </TableCell>
            </TableRow>
          ) : (
            promotions.map((promotion) => (
              <TableRow
                key={promotion.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <TableCell>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {promotion.name}
                    </div>
                    {promotion.description && (
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                        {promotion.description}
                      </div>
                    )}
                    {promotion.code && (
                      <div className="text-xs font-mono text-primary mt-0.5">
                        Mã: {promotion.code}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      promotion.type === "PERCENTAGE"
                        ? "text-indigo-800"
                        : "text-amber-800"
                    }`}
                  >
                    {promotion.type === "PERCENTAGE" ? (
                      <Percent className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    {promotion.type === "PERCENTAGE"
                      ? "Phần trăm"
                      : "Cố định"}
                  </span>
                </TableCell>
                <TableCell className="text-center font-medium text-slate-600">
                  {formatDiscount(promotion)}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      promotion.scope === "BOOK"
                        ? "text-blue-800"
                         : "text-purple-800"
                    }`}
                  >
                    {getScopeLabel(promotion.scope)}
                  </span>
                </TableCell>
                <TableCell className="text-center text-slate-600">
                  {promotion.priority}
                </TableCell>
                <TableCell className="text-center text-xs text-slate-600">
                  <div>{formatDate(promotion.startDate)}</div>
                  <div className="text-slate-400">đến</div>
                  <div>{formatDate(promotion.endDate)}</div>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      promotion.isActive
                        ? "text-green-800"
                        : "text-gray-800"
                    }`}
                  >
                    {promotion.isActive ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-transparent"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      {onEdit && (
                        <DropdownMenuItem
                          onSelect={() => onEdit(promotion)}
                          className="cursor-pointer"
                        >
                          Chỉnh sửa
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setPromotionToDelete(promotion)}
                        className="cursor-pointer text-rose-600 focus:text-rose-600"
                        disabled={isDeleting}
                      >
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!promotionToDelete}
        onOpenChange={(open) => !open && setPromotionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khuyến mãi này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. {promotionToDelete?.name} sẽ bị
              xóa vĩnh viễn cùng tất cả các sản phẩm áp dụng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (promotionToDelete) {
                  onDelete(promotionToDelete.id);
                  setPromotionToDelete(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

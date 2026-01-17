import { useState } from "react";
import { Loader2, MoreVertical } from "lucide-react";
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
import { Plan } from "@/app/feature/plans/types/plans.types";

interface AdminPlanListProps {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  isFetching?: boolean;
}

export function AdminPlanList({
  plans,
  onEdit,
  onDelete,
  isDeleting,
  isFetching,
}: AdminPlanListProps) {
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const formatPrice = (price: number, currency: string) => {
    if (currency.toLowerCase() === "vnd") {
      return `${price.toLocaleString("vi-VN")}₫`;
    }
    return `${price} ${currency.toUpperCase()}`;
  };

  const formatInterval = (interval: string) => {
    return interval === "MONTH" ? "Tháng" : "Năm";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-[0_1px_1px_rgba(0,0,0,0.04)] overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="text-slate-700">Tên gói</TableHead>
            <TableHead className="text-slate-700">Loại</TableHead>
            <TableHead className="text-slate-700">Giá</TableHead>
            <TableHead className="text-slate-700">Chu kỳ</TableHead>
            <TableHead className="text-slate-700">Trạng thái</TableHead>
            <TableHead className="text-right text-slate-700"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetching ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24">
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin text-slate-500" />
                </div>
              </TableCell>
            </TableRow>
          ) : plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Không tìm thấy gói hội viên
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow
                key={plan.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <TableCell className="font-semibold text-slate-900">
                  {plan.name}
                </TableCell>
                <TableCell className="text-slate-600">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plan.plan === "PREMIUM" 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {plan.plan}
                  </span>
                </TableCell>
                <TableCell className="text-slate-600 font-medium">
                  {formatPrice(plan.price, plan.currency)}
                </TableCell>
                <TableCell className="text-slate-600">
                  {formatInterval(plan.interval)}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plan.isActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {plan.isActive ? "Hoạt động" : "Tạm dừng"}
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
                      <DropdownMenuItem
                        onSelect={() => onEdit(plan)}
                        className="cursor-pointer"
                      >
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setPlanToDelete(plan)}
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
        open={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa gói hội viên này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. {planToDelete?.name} sẽ bị
              xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (planToDelete) {
                  onDelete(planToDelete.id);
                  setPlanToDelete(null);
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

"use client";

import { CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plan } from "../types/plans.types";
import { PlanForm } from "./PlanForm";

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
  const isEditMode = Boolean(planToEdit);

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

        <PlanForm
          planToEdit={planToEdit}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

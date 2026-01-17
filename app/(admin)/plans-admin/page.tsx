"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/app/share/components/ui/pagination/pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { deletePlan, getPlans } from "@/app/feature/plans/api/plans.api";
import { AdminPlanList } from "@/app/feature/plans/components/adminPlanList";
import { PlanDialog } from "@/app/feature/plans/components/adminPlanDialog";
import { Plan } from "@/app/feature/plans/types/plans.types";

function PlansPageContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParams = searchParams.get("page");
  const parsedPage = parseInt(pageParams || "1", 10);
  const page = Math.max(1, parsedPage);
  const pageSize = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showFetching, setShowFetching] = useState(false);
  const fetchStartRef = useRef<number | null>(null);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["plans", page],
    queryFn: () =>
      getPlans({
        page,
        limit: pageSize,
      }),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (isFetching) {
      fetchStartRef.current = Date.now();
      setShowFetching(true);
    } else if (showFetching) {
      const elapsed = Date.now() - (fetchStartRef.current ?? 0);
      const remaining = Math.max(0, 500 - elapsed);
      timeoutId = setTimeout(() => {
        setShowFetching(false);
      }, remaining);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isFetching, showFetching]);

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Xóa gói hội viên thành công");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Xóa gói hội viên thất bại."
      );
    },
  });

  const handleCreate = useCallback(() => {
    setSelectedPlan(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((plan: Plan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  if (isError)
    return (
      <div className="p-10 text-rose-600 text-center">
        Không thể tải danh sách gói hội viên
      </div>
    );

  const plans = data?.data ?? [];
  const meta = data?.meta ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 relative overflow-y-auto">
      <div className="max-w-7xl mx-auto relative space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý gói hội viên
            </h1>
            <p className="text-slate-600">
              Tạo và quản lý các gói đăng ký hội viên cho người dùng
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <Button
              className="h-11 bg-primary text-white hover:bg-primary/90"
              onClick={handleCreate}
            >
              <Plus className="h-5 w-5 mr-2" /> Thêm gói mới
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white">
              <AdminPlanList
                plans={plans || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
                isFetching={showFetching}
              />
            </div>
            {meta && <Pagination meta={meta} />}
          </>
        )}

        <PlanDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          planToEdit={selectedPlan}
        />
      </div>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PlansPageContent />
    </Suspense>
  );
}

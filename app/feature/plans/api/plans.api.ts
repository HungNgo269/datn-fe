import { handlePaginatedRequest, handleRequest } from "@/lib/handleApiRequest";
import { axiosClient } from "@/lib/api";
import { Plan, CreatePlanInput, UpdatePlanInput } from "../types/plans.types";
import { PlanFields } from "@/app/schema/planSchema";

export async function getPlans(params: {
  page: number;
  limit: number;
  isActive?: boolean;
}) {
  return handlePaginatedRequest<Plan>(() =>
    axiosClient.get("/admin/plans", { params })
  );
}

export async function getPlanById(id: number) {
  return handleRequest<Plan>(() => axiosClient.get(`/admin/plans/${id}`));
}

export async function createPlan(payload: PlanFields) {
  console.log("Creating plan with payload:", payload);
  return handleRequest<Plan>(() =>
    axiosClient.post("/admin/plans", payload)
  );
}

export async function updatePlan(id: number, payload: PlanFields) {
  return handleRequest<Plan>(() =>
    axiosClient.patch(`/admin/plans/${id}`, payload)
  );
}

export async function deletePlan(id: number) {
  return handleRequest<boolean>(() => axiosClient.delete(`/admin/plans/${id}`));
}

export async function getActivePlans() {
  // Use the public endpoint that returns active plans
  return handleRequest<Plan[]>(() => 
    axiosClient.get("/plans")
  );
}

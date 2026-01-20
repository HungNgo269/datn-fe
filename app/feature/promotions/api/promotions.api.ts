// Real API for promotions - connected to backend

import { handleRequest } from "@/lib/handleApiRequest";
import { axiosClient } from "@/lib/api";
import {
  Promotion,
  CreateBookPromotionDto,
  CreatePlanPromotionDto,
  UpdatePromotionDto,
} from "../types/promotions.types";

// ===== PROMOTIONS CRUD =====

export async function getPromotions() {
  return handleRequest<Promotion[]>(() =>
    axiosClient.get("/admin/promotions")
  );
}

export async function getPromotionById(id: number) {
  return handleRequest<Promotion>(() =>
    axiosClient.get(`/admin/promotions/${id}`)
  );
}

export async function createBookPromotion(dto: CreateBookPromotionDto) {
  return handleRequest<Promotion>(() =>
    axiosClient.post("/admin/promotions", dto)
  );
}

export async function createPlanPromotion(dto: CreatePlanPromotionDto) {
  return handleRequest<Promotion>(() =>
    axiosClient.post("/admin/promotions", dto)
  );
}

export async function updatePromotion(id: number, dto: UpdatePromotionDto) {
  return handleRequest<Promotion>(() =>
    axiosClient.patch(`/admin/promotions/${id}`, dto)
  );
}

export async function deletePromotion(id: number) {
  return handleRequest<Promotion>(() =>
    axiosClient.delete(`/admin/promotions/${id}`)
  );
}

// ===== FILTER PROMOTIONS BY SCOPE =====

export async function getBookPromotions() {
  const promotions = await getPromotions();
  return promotions.filter((p) => p.scope === "BOOK");
}

export async function getPlanPromotions() {
  const promotions = await getPromotions();
  return promotions.filter((p) => p.scope === "SUBSCRIPTION");
}

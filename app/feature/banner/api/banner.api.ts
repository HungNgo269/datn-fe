import { handlePaginatedRequest, handleRequest } from "@/lib/handleApiRequest";
import { axiosClient } from "@/lib/api";
import { Banner, BannerPosition } from "../types/banner.types";
import { BannerFormValues } from "../schema/banner.schema";

export async function getBannersHomeSlider(params: {
  page: number;
  limit: number;
  position: BannerPosition;
}) {
  return handlePaginatedRequest<Banner>(() =>
    axiosClient.get("/banners", { params })
  );
}

export async function getBanners(params: { page: number; limit: number }) {
  return handlePaginatedRequest<Banner>(() =>
    axiosClient.get("/admin/banners", { params })
  );
}

export async function getBannerById(id: number) {
  return handleRequest<Banner>(() => axiosClient.get(`/admin/banners/${id}`));
}

export async function createBanner(payload: BannerFormValues) {
  return handleRequest<Banner>(() =>
    axiosClient.post("/admin/banners", payload)
  );
}

export async function updateBanner(
  id: number,
  payload: Partial<BannerFormValues>
) {
  return handleRequest<Banner>(() =>
    axiosClient.patch(`/admin/banners/${id}`, payload)
  );
}

export async function deleteBanner(id: number) {
  return handleRequest<boolean>(() =>
    axiosClient.delete(`/admin/banners/${id}`)
  );
}

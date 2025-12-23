import { axiosClient } from "@/lib/api";
import { Banner } from "../types/banner.types";
import { handlePaginatedRequest } from "@/lib/handleApiRequest";
export async function getAllBanners() {
  return handlePaginatedRequest<Banner>(() => axiosClient.get(`/banners`));
}

"use server";

import { handleActionPaginatedRequest } from "@/lib/handleActionRequest";
import { Banner, BannerPosition } from "../types/banner.types";

const HOME_BANNER_REVALIDATE_SECONDS = 60;

interface GetBannerOptions {
  page?: number;
  limit?: number;
  position?: BannerPosition;
  revalidate?: number;
}

export async function getHomeBannersAction(
  options: GetBannerOptions = {}
) {
  const {
    page = 1,
    limit = 4,
    position = BannerPosition.HOME_SLIDER,
    revalidate = HOME_BANNER_REVALIDATE_SECONDS,
  } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    position,
  });

  return handleActionPaginatedRequest<Banner>(
    `/banners?${params.toString()}`,
    {
      revalidate,
    }
  );
}

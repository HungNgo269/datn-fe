import BannerHomeSliderClient from "./bannerHomeSliderClient";
import { getHomeBannersAction } from "../actions/banner.action";

export default async function BannerHomeSlider() {
  try {
    const bannerResponse = await getHomeBannersAction({ page: 1, limit: 4 });
    const banners = bannerResponse?.data ?? [];

    if (!banners.length) {
      return (
        <div className="flex justify-center p-10 text-sm text-muted-foreground">
          Hiện chưa có banner nào để hiển thị.
        </div>
      );
    }

    return (
      <BannerHomeSliderClient
        banners={banners}
        total={bannerResponse.meta?.total}
      />
    );
  } catch {
    return (
      <div className="p-10 text-center text-destructive">
        Không thể tải dữ liệu banner.
      </div>
    );
  }
}

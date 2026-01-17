import { getRightSideBannerByIndex } from "@/app/feature/banner/actions/banner.action";
import { PremiumBannerClient } from "./PremiumBannerClient";

interface PremiumBannerProps {
  className?: string;
}

export async function PremiumBanner({ className }: PremiumBannerProps) {
  let bannerData = null;

  try {
    const bannerResponse = await getRightSideBannerByIndex(1, {
      page: 1,
      limit: 1,
    });
    // Safely extract the first banner if available
    const banners = bannerResponse?.data?.[0];
    if (banners) {
       bannerData = banners;
    }
  } catch (error) {
    console.error("Failed to fetch Premium Banner data:", error);
  }

  return <PremiumBannerClient className={className} bannerData={bannerData} />;
}

import Image from "next/image";
import { getRightSideBannerByIndex } from "../actions/banner.action";
import Link from "next/link";

export default async function BannerRight() {
  try {
    const bannerResponse = await getRightSideBannerByIndex(1, {
      page: 1,
      limit: 1,
    });
    console.log("BannerRight: response", JSON.stringify(bannerResponse));
    const banners = bannerResponse?.data[0] ?? 0;
    console.log("BannerRight: banners", banners);

    if (!banners) {
      console.log("BannerRight: Returning null because no banners");
      return null;
    }

    return (
      <Link
        href={`/${banners.linkUrl}`}
        className="relative w-full lg:h-[207px] hover:cursor-pointer"
      >
        <Image
          fill
          className="object-cover rounded-md"
          src={banners.imageUrl}
          alt={banners.description! ?? ""}
        ></Image>
      </Link>
    );
  } catch {
    return null;
  }
}

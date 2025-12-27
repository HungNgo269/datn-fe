import Image from "next/image";
import Link from "next/link";
import { Banner } from "../types/banner.types";

interface BannerContentProps {
  banners: Banner[];
  currentBanner: number;
}

export default function BannerContent({
  banners,
  currentBanner,
}: BannerContentProps) {
  console.log("checkbanner", banners);
  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-in-out h-full"
        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="w-full flex-shrink-0 relative">
            <Link
              prefetch={true}
              href={banner.linkUrl!}
              className="block w-full h-full group"
            >
              <div className="relative w-full h-full">
                <Image
                  src={banner.imageUrl}
                  alt={banner?.title || "banner name"}
                  fill
                  sizes="100vw"
                  quality={100}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="text-primary-foreground p-8 md:p-12 max-w-2xl">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
                      {banner.title}
                    </h2>
                    {banner.description && (
                      <p className="text-lg md:text-xl mb-6 opacity-90">
                        {banner.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

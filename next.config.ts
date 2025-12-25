import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "ebook.82d37924634f3d2eb54a2930e0512f78.r2.cloudflarestorage.com",
      },
    ],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;

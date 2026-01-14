import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/**",
      },
      {
        pathname: "/images/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "ebook.82d37924634f3d2eb54a2930e0512f78.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-34da7137786c42e8b75b328bdd237d48.r2.dev",
      },
    ],
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;

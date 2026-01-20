import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "@radix-ui/react-avatar", "@radix-ui/react-separator", "@radix-ui/react-slot"],
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "ebook.82d37924634f3d2eb54a2930e0512f78.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname:
          "ebook-cloud.82d37924634f3d2eb54a2930e0512f78.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-34da7137786c42e8b75b328bdd237d48.r2.dev",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "ebook-api.bluerock-6b3eb402.southeastasia.azurecontainerapps.io",
      },
      {
        protocol: "https",
        hostname: "pub-8060b3b596c54e4183294385a3ff07c8.r2.dev",
      },
    ],
    // Cache optimized images for 7 days
    minimumCacheTTL: 604800,
    // Enable image optimization
    formats: ['image/webp'],
  },
};

export default nextConfig;

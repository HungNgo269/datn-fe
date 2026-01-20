import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeStorageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // CDN Configuration
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || "https://pub-34da7137786c42e8b75b328bdd237d48.r2.dev";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. If URL starts with API URL, replace it with CDN URL
  // This fixes the "upstream" error where backend returns API URL for static files
  if (apiUrl && url.startsWith(apiUrl)) {
    // Remove API URL and ensure we have a clean path
    const path = url.replace(apiUrl, "");
    // Handle potential double slashes if API URL had trailing slash
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const cleanCdn = cdnUrl.endsWith("/") ? cdnUrl.slice(0, -1) : cdnUrl;
    return `${cleanCdn}${cleanPath}`;
  }

  // 2. If it's already a full URL (and didn't match API URL ABOVE), return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // 3. Handle relative paths (prepend CDN URL)
  const baseUrl = cdnUrl.endsWith("/") ? cdnUrl.slice(0, -1) : cdnUrl;
  const path = url.startsWith("/") ? url : `/${url}`;

  return `${baseUrl}${path}`;
}

export function getValidBannerUrl(url: string | null | undefined): string {
  return normalizeStorageUrl(url);
}

export function getValidImageUrl(url: string | null | undefined): string {
  return normalizeStorageUrl(url);
}

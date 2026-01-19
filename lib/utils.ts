import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeStorageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // If it's already a full URL (from backend public presigned URL), return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If it's a local path (starts with /), return as-is
  if (url.startsWith("/")) {
    return url;
  }

  // Handle relative paths without leading slash (e.g., "uploads/...")
  return `/${url}`;
}

export function getValidBannerUrl(url: string | null | undefined): string {
  return normalizeStorageUrl(url);
}

export function getValidImageUrl(url: string | null | undefined): string {
  return normalizeStorageUrl(url);
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeStorageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Check if URL is malformed (contains double protocol)
  // e.g. https://bucket/https%3A//bucket...
  const isDoubleUrl =
    url.includes("https%3A//") || (url.match(/https?:\/\//g) || []).length > 1;

  if (isDoubleUrl) {
    // Try to extract the relative path starting with uploads/
    // This regex looks for uploads/ followed by anything not a '?' (query param start)
    const match = url.match(/(uploads\/[^?]+)/);
    if (match && match[1]) {
      return `/api/view-image?key=${encodeURIComponent(match[1])}`;
    }
  }

  return url;
}

export function getValidBannerUrl(url: string | null | undefined): string {
  return normalizeStorageUrl(url);
}

export function getValidImageUrl(url: string | null | undefined): string {
  return normalizeStorageUrl(url);
}

/**
 * Extract storage key from a public presigned URL
 * Example: "https://pub-xyz.r2.dev/uploads/covers/uuid.jpg" → "uploads/covers/uuid.jpg"
 * 
 * @param urlOrKey - Full URL or storage key
 * @returns Storage key without domain
 */
export function extractStorageKey(urlOrKey: string | null | undefined): string {
  if (!urlOrKey) return "";
  
  // If it's already just a key (doesn't start with http), return as-is
  if (!urlOrKey.startsWith("http://") && !urlOrKey.startsWith("https://")) {
    return urlOrKey;
  }
  
  // Extract path from full URL
  try {
    const url = new URL(urlOrKey);
    // Remove leading slash from pathname
    return url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
  } catch {
    // If URL parsing fails, return the original value
    return urlOrKey;
  }
}

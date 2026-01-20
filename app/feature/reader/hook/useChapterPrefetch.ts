import { useEffect } from "react";
import { getChaptersDetails } from "@/app/feature/chapters/actions/chapters.actions";

interface UseChapterPrefetchProps {
  bookSlug?: string;
  nextChapterSlug?: string | null;
}

export function useChapterPrefetch({
  bookSlug,
  nextChapterSlug,
}: UseChapterPrefetchProps) {
  useEffect(() => {
    if (!bookSlug || !nextChapterSlug) return;

    const prefetchNextChapter = async () => {
      const cacheKey = `chapter-content-${bookSlug}-${nextChapterSlug}`;

      try {
        // 1. Check if already cached
        if ("caches" in window) {
          const cache = await caches.open("book-chapters-v1");
          const cachedResponse = await cache.match(cacheKey);
          
          if (cachedResponse) {
             const timestamp = cachedResponse.headers.get("X-Cache-Timestamp");
             const now = Date.now();
             const twoHours = 2 * 60 * 60 * 1000;
             
             if (timestamp && now - parseInt(timestamp, 10) < twoHours) {
                // Already valid in cache, skip
                return;
             }
             // Expired, continue to fetch
          }
        }

        // 2. Fetch URL
        const details = await getChaptersDetails(bookSlug, nextChapterSlug);
        if (!details.hasAccess || !details.contentUrl) return;

        // 3. Fetch Content
        const response = await fetch(details.contentUrl);
        if (!response.ok) return;

        const content = await response.text();

        // 4. Cache
         if ("caches" in window) {
          const cache = await caches.open("book-chapters-v1");
          const cacheResponse = new Response(content, {
            headers: { 
                "Content-Type": "text/html",
                "X-Cache-Timestamp": Date.now().toString()
            },
          });
          await cache.put(cacheKey, cacheResponse);
          console.log(`Prefetched chapter: ${nextChapterSlug}`);
        }

      } catch (error) {
        console.error("Prefetch failed:", error);
      }
    };

    // Delay prefetch slightly to let current chapter load first
    const timer = setTimeout(prefetchNextChapter, 2000);
    return () => clearTimeout(timer);

  }, [bookSlug, nextChapterSlug]);
}

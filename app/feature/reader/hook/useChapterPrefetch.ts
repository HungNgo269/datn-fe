import { useEffect } from "react";

const CACHE_NAME = "book-chapters-v2";
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;
const CACHE_VERSION = "2";

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

    const normalizedNextSlug = nextChapterSlug.trim();
    if (!normalizedNextSlug || normalizedNextSlug === "undefined" || normalizedNextSlug === "null") {
      return;
    }

    const prefetchNextChapter = async () => {
      const cacheKey = `chapter-content-${bookSlug}-${normalizedNextSlug}`;
      const streamUrl = `/api/chapter/${encodeURIComponent(
        normalizedNextSlug
      )}/stream?bookSlug=${encodeURIComponent(bookSlug)}`;

      try {
        // 1. Check if already cached
        if ("caches" in window) {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(cacheKey);
          
          if (cachedResponse) {
            const timestamp = cachedResponse.headers.get("X-Cache-Timestamp");
            const now = Date.now();

            if (timestamp && now - parseInt(timestamp, 10) < CACHE_TTL_MS) {
              // Already valid in cache, skip
              return;
            }
            // Expired, continue to fetch
          }
        }

        // 2. Fetch stream
        const response = await fetch(streamUrl);
        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let headHtml = "";
        let bodyHtml = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split("\n");
          buffer = messages.pop() || "";

          for (const message of messages) {
            if (!message.trim()) continue;
            let data: Record<string, unknown>;
            try {
              data = JSON.parse(message);
            } catch {
              continue;
            }

            if (data.type === "styles" && typeof data.content === "string") {
              headHtml = data.content;
            }

            if (data.type === "chunk" && typeof data.content === "string") {
              bodyHtml += data.content;
            }
          }
        }

        buffer += decoder.decode();
        if (buffer.trim()) {
          const lines = buffer.split("\n").filter(Boolean);
          for (const line of lines) {
            let data: Record<string, unknown>;
            try {
              data = JSON.parse(line);
            } catch {
              continue;
            }

            if (data.type === "styles" && typeof data.content === "string") {
              headHtml = data.content;
            }

            if (data.type === "chunk" && typeof data.content === "string") {
              bodyHtml += data.content;
            }
          }
        }

        if (!bodyHtml) return;

        // 3. Cache
        if ("caches" in window) {
          const cache = await caches.open(CACHE_NAME);
          const payload = JSON.stringify({ head: headHtml, body: bodyHtml });
          const cacheResponse = new Response(payload, {
            headers: {
              "Content-Type": "application/json",
              "X-Cache-Version": CACHE_VERSION,
              "X-Cache-Timestamp": Date.now().toString(),
            },
          });
          await cache.put(cacheKey, cacheResponse);
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

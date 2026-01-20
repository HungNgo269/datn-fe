import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { extractHtmlForStreaming } from "@/lib/htmlStreamParser";

interface UseChapterStreamProps {
  contentUrl?: string | null;
  chapterSlug?: string;
  bookSlug?: string;
  enabled?: boolean;
  refreshKey?: number;
  onChunk?: (chunk: string) => void;
  onHead?: (headHtml: string) => void;
  onFinish?: () => void;
}

interface StreamState {
  content: string;
  isLoading: boolean;
  progress: number; // 0 to 100
  error: string | null;
  isCached: boolean;
}

const CACHE_NAME = "book-chapters-v2";
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;
const CACHE_VERSION = "2";

const normalizeSlug = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return null;
  }
  return trimmed;
};

export function useChapterStream({
  contentUrl,
  chapterSlug,
  bookSlug,
  enabled = true,
  refreshKey = 0,
  onChunk,
  onHead,
  onFinish,
}: UseChapterStreamProps) {
  const normalizedChapterSlug = useMemo(
    () => normalizeSlug(chapterSlug),
    [chapterSlug],
  );

  const [state, setState] = useState<StreamState>({
    content: "",
    isLoading: Boolean(
      enabled && (contentUrl || (bookSlug && normalizedChapterSlug)),
    ),
    progress: 0,
    error: null,
    isCached: false,
  });

  const onChunkRef = useRef(onChunk);
  const onHeadRef = useRef(onHead);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onChunkRef.current = onChunk;
    onHeadRef.current = onHead;
    onFinishRef.current = onFinish;
  }, [onChunk, onHead, onFinish]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheKey = useMemo(() => {
    if (!bookSlug || !normalizedChapterSlug) return null;
    return `chapter-content-${bookSlug}-${normalizedChapterSlug}`;
  }, [bookSlug, normalizedChapterSlug]);

  const streamUrl = useMemo(() => {
    if (contentUrl) {
      const safeChapterSlug = normalizedChapterSlug ?? "stream";
      return `/api/chapter/${encodeURIComponent(
        safeChapterSlug,
      )}/stream?contentUrl=${encodeURIComponent(contentUrl)}`;
    }
    if (bookSlug && normalizedChapterSlug) {
      return `/api/chapter/${encodeURIComponent(
        normalizedChapterSlug,
      )}/stream?bookSlug=${encodeURIComponent(bookSlug)}`;
    }
    return null;
  }, [bookSlug, contentUrl, normalizedChapterSlug]);
  const fetchAndStream = useCallback(async () => {
    if (!enabled || !streamUrl) {
      setState((prev) => ({
        ...prev,
        content: "",
        isLoading: false,
        progress: 0,
        error: null,
        isCached: false,
      }));
      return;
    }

    setState({
      content: "",
      isLoading: true,
      progress: 0,
      error: null,
      isCached: false,
    });

    abortControllerRef.current = new AbortController();

    try {
      // 1. Check Cache
      if ("caches" in window && cacheKey) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
          const timestamp = cachedResponse.headers.get("X-Cache-Timestamp");
          const now = Date.now();
          const cacheVersion =
            cachedResponse.headers.get("X-Cache-Version") ?? "1";
          const contentType = cachedResponse.headers.get("Content-Type") ?? "";

          if (timestamp && now - parseInt(timestamp, 10) < CACHE_TTL_MS) {
            let headHtml = "";
            let bodyHtml = "";

            if (
              cacheVersion === CACHE_VERSION &&
              contentType.includes("application/json")
            ) {
              const cachedPayload = await cachedResponse.json();
              if (cachedPayload && typeof cachedPayload === "object") {
                headHtml =
                  typeof cachedPayload.head === "string"
                    ? cachedPayload.head
                    : "";
                bodyHtml =
                  typeof cachedPayload.body === "string"
                    ? cachedPayload.body
                    : "";
              }
            } else {
              const content = await cachedResponse.text();
              const extracted = extractHtmlForStreaming(content);
              headHtml = extracted.styles;
              bodyHtml = extracted.body;
            }

            if (headHtml && onHeadRef.current) {
              onHeadRef.current(headHtml);
            }

            if (bodyHtml && onChunkRef.current) {
              onChunkRef.current(bodyHtml);
            }

            if (onFinishRef.current) onFinishRef.current();
            setState({
              content: bodyHtml,
              isLoading: false,
              progress: 100,
              error: null,
              isCached: true,
            });
            return;
          } else {
            // Cache expired, delete it
            await cache.delete(cacheKey);
          }
        }
      }

      // 2. Fetch if not cached
      const response = await fetch(streamUrl, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to load chapter: ${response.statusText}`);
      }

      if (!response.body) {
        const rawText = await response.text();
        const lines = rawText.split("\n").filter(Boolean);
        let headHtml = "";
        let bodyHtml = "";

        for (const line of lines) {
          let data: Record<string, unknown>;
          try {
            data = JSON.parse(line);
          } catch {
            continue;
          }

          if (data.type === "styles" && typeof data.content === "string") {
            headHtml = data.content;
            onHeadRef.current?.(headHtml);
            continue;
          }

          if (data.type === "chunk" && typeof data.content === "string") {
            bodyHtml += data.content;
            onChunkRef.current?.(data.content);
          }
        }

        onFinishRef.current?.();
        setState((prev) => ({
          ...prev,
          content: bodyHtml,
          isLoading: false,
          progress: 100,
        }));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let headHtml = "";
      let bodyHtml = "";
      let totalChunks = 0;
      let receivedChunks = 0;
      const headerTotal = response.headers.get("X-Total-Chunks");

      if (headerTotal) {
        const parsedTotal = parseInt(headerTotal, 10);
        if (!isNaN(parsedTotal)) {
          totalChunks = parsedTotal;
        }
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

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

          if (data.type === "meta" && typeof data.totalChunks === "number") {
            totalChunks = data.totalChunks;
          }

          if (data.type === "styles" && typeof data.content === "string") {
            headHtml = data.content;
            onHeadRef.current?.(headHtml);
            continue;
          }

          if (data.type === "chunk" && typeof data.content === "string") {
            bodyHtml += data.content;
            receivedChunks += 1;
            onChunkRef.current?.(data.content);

            const progress = totalChunks
              ? Math.round((receivedChunks / totalChunks) * 100)
              : 0;

            setState((prev) => ({
              ...prev,
              progress,
              isLoading: true,
            }));
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
            onHeadRef.current?.(headHtml);
          }

          if (data.type === "chunk" && typeof data.content === "string") {
            bodyHtml += data.content;
            onChunkRef.current?.(data.content);
          }
        }
      }

      if (onFinishRef.current) {
        onFinishRef.current();
      }

      setState((prev) => ({
        ...prev,
        content: bodyHtml,
        isLoading: false,
        progress: 100,
      }));

      // 3. Cache the complete content
      if ("caches" in window && cacheKey) {
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
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [enabled, cacheKey, streamUrl, refreshKey]);

  useEffect(() => {
    fetchAndStream();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAndStream]);

  return state;
}

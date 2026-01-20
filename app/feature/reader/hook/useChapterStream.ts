import { useState, useEffect, useRef, useCallback } from "react";

interface UseChapterStreamProps {
  contentUrl?: string | null;
  chapterSlug?: string;
  bookSlug?: string;
  onChunk?: (chunk: string) => void;
  onFinish?: () => void;
}

interface StreamState {
  content: string;
  isLoading: boolean;
  progress: number; // 0 to 100
  error: string | null;
  isCached: boolean;
}

export function useChapterStream({
  contentUrl,
  chapterSlug,
  bookSlug,
  onChunk,
  onFinish,
}: UseChapterStreamProps) {
  const [state, setState] = useState<StreamState>({
    content: "",
    isLoading: !!contentUrl,
    progress: 0,
    error: null,
    isCached: false,
  });

  const onChunkRef = useRef(onChunk);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onChunkRef.current = onChunk;
    onFinishRef.current = onFinish;
  }, [onChunk, onFinish]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheKey = `chapter-content-${bookSlug}-${chapterSlug}`;

  const fetchAndStream = useCallback(async () => {
    if (!contentUrl) {
      setState((prev) => ({ ...prev, isLoading: false }));
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
      if ("caches" in window) {
        const cache = await caches.open("book-chapters-v1");
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
          const timestamp = cachedResponse.headers.get("X-Cache-Timestamp");
          const now = Date.now();
          const twoHours = 2 * 60 * 60 * 1000;

          if (timestamp && now - parseInt(timestamp, 10) < twoHours) {
            const content = await cachedResponse.text();
            if (onFinishRef.current) onFinishRef.current();
            setState({
              content,
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
      const response = await fetch(contentUrl, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to load chapter: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported");
      }

      const contentLength = response.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        loaded += value.length;

        if (onChunkRef.current) {
          onChunkRef.current(chunk);
        }

        setState((prev) => ({
          ...prev,
          content: prev.content + chunk, // Progressive update
          progress: total ? Math.round((loaded / total) * 100) : 0,
          isLoading: true,
        }));
      }

      // Final flush
      fullContent += decoder.decode(); 
      
      if (onFinishRef.current) {
         onFinishRef.current();
      }
      
      setState((prev) => ({
        ...prev,
        content: fullContent,
        isLoading: false,
        progress: 100,
      }));

      // 3. Cache the complete content
      if ("caches" in window) {
        const cache = await caches.open("book-chapters-v1");
        const cacheResponse = new Response(fullContent, {
          headers: { 
              "Content-Type": "text/html",
              "X-Cache-Timestamp": Date.now().toString()
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
  }, [contentUrl, cacheKey]);

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

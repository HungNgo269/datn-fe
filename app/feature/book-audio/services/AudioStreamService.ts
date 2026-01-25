import { getChapterAudio } from "../api/audio.api";

const CACHE_NAME = 'audio-cache-v1';
const PREFETCH_BUFFER_SIZE = 2; // Number of next chapters to prefetch
const CLIENT_ID_KEY = 'audio-client-id';

export interface AudioSource {
  url: string;
  sourceType: 'cache' | 'network';
  mimeType?: string;
  duration?: number;
  isTTS?: boolean;
}

let prefetchQueue: string[] = [];
let isPrefetching = false;

function getClientId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    let clientId = window.localStorage.getItem(CLIENT_ID_KEY);
    if (!clientId) {
      const hasCrypto = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';
      clientId = hasCrypto
        ? crypto.randomUUID()
        : `audio-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(CLIENT_ID_KEY, clientId);
    }
    return clientId;
  } catch {
    return null;
  }
}

/**
 * Fetch audio with retry logic, timeout handling, and source detection
 */
async function fetchAudioWithRetry(
  url: string,
  attempt = 1,
  onStateChange?: (state: 'loading' | 'synthesizing' | 'downloading') => void
): Promise<{ response: Response; isTTS: boolean }> {
  // Timeout calculation: 30s, 45s, 60s
  const timeout = 30000 + (attempt - 1) * 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    if (onStateChange) onStateChange('loading');

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Add any needed headers here
      }
    });

    if (!response.ok) {
        // Check for 429/503 for specific handling if needed, otherwise throw to retry
      if (response.status === 429 || response.status === 503) {
            const errorBody = await response.text();
            throw new Error(`Service Unavailable: ${response.status} - ${errorBody}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check headers
    const audioSource = response.headers.get('X-Audio-Source');
    const isTTS = audioSource === 'tts';
    
    if (isTTS && onStateChange) {
      onStateChange('synthesizing');
    } else if (onStateChange) {
      onStateChange('downloading');
    }

    return { response, isTTS };

  } catch (error: any) {
    if (attempt < 3) {
      // Retry on AbortError (Timeout) or Network Error
      // Won't retry on 4xx unless we specifically want to
      const isRetryable = 
          error.name === 'AbortError' || 
          error.message.includes('Network request failed') ||
          error.message.includes('Service Unavailable');

      if (isRetryable) {
          console.warn(`Audio fetch attempt ${attempt} failed, retrying...`, error);
          // Wait before retry: 2s, 5s
          const delayMs = attempt === 1 ? 2000 : 5000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return fetchAudioWithRetry(url, attempt + 1, onStateChange);
      }
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getFromCache(chapterId: string): Promise<Response | undefined> {
  if (!('caches' in window)) return undefined;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(`/audio-cache/${chapterId}`);
    return response;
  } catch (error) {
    console.warn('Cache lookup failed:', error);
    return undefined;
  }
}

/**
 * Get audio source for playback.
 * Checks cache first, then returns direct URL for streaming.
 * NO LONGER fetches and caches immediately to allow instant playback.
 */
export async function getAudioSource(
  chapterId: string,
  forceNetwork = false,
  onStateChange?: (state: 'loading' | 'synthesizing' | 'downloading') => void,
  playId?: string
): Promise<AudioSource> {
  try {
    // 1. Check Cache (unless forced)
    if (!forceNetwork) {
      const cachedResponse = await getFromCache(chapterId);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        const url = URL.createObjectURL(blob);
        return { 
          url, 
          sourceType: 'cache',
          mimeType: blob.type 
        };
      }
    }

    // 2. Get API URL
    const { url: audioUrl, duration } = await getChapterAudio(chapterId);
    const clientId = getClientId();
    let playbackUrl = audioUrl;
    if (clientId) {
      try {
        const isAbsolute = audioUrl.startsWith('http://') || audioUrl.startsWith('https://');
        const base = isAbsolute ? undefined : window.location.origin;
        const resolvedUrl = new URL(audioUrl, base);
        
        // resolvedUrl.searchParams.set('clientId', clientId);
        // if (playId) {
        //   resolvedUrl.searchParams.set('playId', playId);
        // }
        
        // Add timestamp to prevent caching issues (similar to test HTML)
        // resolvedUrl.searchParams.set('t', Date.now().toString());
        
        playbackUrl = resolvedUrl.toString();
      } catch {
        playbackUrl = audioUrl;
      }
    }
    
    // 3. Direct Stream - Return URL immediately
    // We skip manual fetch/blob/cache to avoid waiting for full download.
    // The browser's <audio> tag will handle buffering.
    
    if (onStateChange) onStateChange('loading');

    return { 
      url: playbackUrl, 
      sourceType: 'network',
      duration: duration ? duration * 1000 : undefined,
      isTTS: false // We don't know yet, but it doesn't matter for playback
    };
  } catch (error) {
    console.error('Error getting audio source:', error);
    throw error;
  }
}

/**
 * Fetch and cache audio for prefetching purposes
 */
export async function fetchAndCache(chapterId: string) {
    try {
      const { url: audioUrl } = await getChapterAudio(chapterId);
      const { response } = await fetchAudioWithRetry(audioUrl, 1);
      
      const blob = await response.blob();
      if ('caches' in window) {
          const cache = await caches.open(CACHE_NAME);
          const responseToCache = new Response(blob, {
              headers: response.headers
          });
          await cache.put(`/audio-cache/${chapterId}`, responseToCache);
      }
    } catch (error) {
        console.warn(`Failed to prefetch/cache chapter ${chapterId}:`, error);
    }
}

async function processPrefetchQueue() {
  if (isPrefetching || prefetchQueue.length === 0) return;

  isPrefetching = true;
  const chapterId = prefetchQueue.shift();

  if (chapterId) {
    try {
      // Check if already cached
      const cached = await getFromCache(chapterId);
      if (!cached) {
          // Explicitly fetch and cache
          await fetchAndCache(chapterId);
      }
    } catch (error) {
      console.warn(`Prefetch failed for ${chapterId}:`, error);
    }
  }

  isPrefetching = false;
  // Process next item
  if (prefetchQueue.length > 0) {
    processPrefetchQueue();
  }
}

/**
 * Prefetch upcoming chapters to ensure smooth transition
 */
export function prefetchChapters(chapterIds: string[]) {
  prefetchQueue = chapterIds.slice(0, PREFETCH_BUFFER_SIZE);
  processPrefetchQueue();
}

/**
 * Clear old cache entries if needed
 */
export async function clearCache() {
  if ('caches' in window) {
    await caches.delete(CACHE_NAME);
  }
}

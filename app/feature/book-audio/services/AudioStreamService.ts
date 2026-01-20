import { getChapterAudio } from "../api/audio.api";

const CACHE_NAME = 'audio-cache-v1';
const PREFETCH_BUFFER_SIZE = 2; // Number of next chapters to prefetch

export interface AudioSource {
  url: string;
  sourceType: 'cache' | 'network';
  mimeType?: string;
  duration?: number;
}

class AudioStreamService {
  private static instance: AudioStreamService;
  private prefetchQueue: string[] = [];
  private isPrefetching = false;

  private constructor() {}

  public static getInstance(): AudioStreamService {
    if (!AudioStreamService.instance) {
      AudioStreamService.instance = new AudioStreamService();
    }
    return AudioStreamService.instance;
  }

  /**
   * Get audio source for playback.
   * Checks cache first, then fetches fresh URL if needed.
   * Triggers background caching if playing from network.
   */
  public async getAudioSource(chapterId: string, forceNetwork = false): Promise<AudioSource> {
    try {
      // 1. Check Cache (unless forced)
      if (!forceNetwork) {
        const cachedResponse = await this.getFromCache(chapterId);
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

      // 2. Fetch fresh presigned URL
      const response = await getChapterAudio(chapterId);
      
      // 3. Start background caching (fire and forget)
      this.cacheAudioInBackground(chapterId, response.url).catch(err => {
        console.warn('Background caching failed:', err);
      });

      return { 
        url: response.url, 
        sourceType: 'network',
        duration: response.duration * 1000 // Convert to ms
      };
    } catch (error) {
      console.error('Error getting audio source:', error);
      throw error;
    }
  }

  /**
   * Prefetch upcoming chapters to ensure smooth transition
   */
  public prefetchChapters(chapterIds: string[]) {
    this.prefetchQueue = chapterIds.slice(0, PREFETCH_BUFFER_SIZE);
    this.processPrefetchQueue();
  }

  private async processPrefetchQueue() {
    if (this.isPrefetching || this.prefetchQueue.length === 0) return;

    this.isPrefetching = true;
    const chapterId = this.prefetchQueue.shift();

    if (chapterId) {
      try {
        // Check if already cached
        const cached = await this.getFromCache(chapterId);
        if (!cached) {
          const { url } = await getChapterAudio(chapterId);
          await this.cacheAudioInBackground(chapterId, url);
        }
      } catch (error) {
        console.warn(`Prefetch failed for ${chapterId}:`, error);
      }
    }

    this.isPrefetching = false;
    // Process next item
    if (this.prefetchQueue.length > 0) {
      this.processPrefetchQueue();
    }
  }

  private async getFromCache(chapterId: string): Promise<Response | undefined> {
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

  private async cacheAudioInBackground(chapterId: string, url: string) {
    if (!('caches' in window)) return;

    try {
      // Fetch the actual audio file
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const cache = await caches.open(CACHE_NAME);
      
      // We store it with a dummy internal URL key
      // We clone the response because the body can only be consumed once
      await cache.put(`/audio-cache/${chapterId}`, response);
      
      // Manage cache size (simple LRU could be added here, 
      // but for now relying on browser quota management or simple cleanup)
      // verifyCacheSize();
    } catch (error) {
      console.warn('Failed to cache audio:', error);
    }
  }

  /**
   * Clear old cache entries if needed
   */
  public async clearCache() {
    if ('caches' in window) {
      await caches.delete(CACHE_NAME);
    }
  }
}

export const audioStreamService = AudioStreamService.getInstance();

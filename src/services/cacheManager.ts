type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttlMs: number;
};

class MemoryCacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Promise<unknown>>();

  /**
   * Set a cached value with a time-to-live (TTL) in milliseconds.
   */
  set<T>(key: string, data: T, ttlMs: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
    });
  }

  /**
   * Get a cached value if it has not expired.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Get a cached value even if stale (useful for optimistic UI updates).
   */
  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    return entry ? entry.data : null;
  }

  /**
   * Fetch with cache and automatic request deduplication.
   * If fresh data exists, returns it immediately.
   * If concurrent requests for the same key are fired, deduplicates them.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 60000,
    forceRefresh: boolean = false,
  ): Promise<T> {
    if (!forceRefresh) {
      const cached = this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Deduplicate in-flight promises
    const existing = this.inFlight.get(key) as Promise<T> | undefined;
    if (existing) {
      return existing;
    }

    const promise = (async () => {
      try {
        const data = await fetcher();
        this.set(key, data, ttlMs);
        return data;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Invalidate a single key or all keys matching a prefix.
   */
  invalidate(keyOrPrefix: string, isPrefix: boolean = false): void {
    if (!isPrefix) {
      this.cache.delete(keyOrPrefix);
      this.inFlight.delete(keyOrPrefix);
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data.
   */
  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }
}

export const cacheManager = new MemoryCacheManager();

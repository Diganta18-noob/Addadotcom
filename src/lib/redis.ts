// ─── Lightweight High-Speed Cache Manager ─────────────────────────
// Supports in-memory KV caching with TTL and optional Redis integration

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();

export class CacheManager {
  /**
   * Get cached item by key. Returns null if expired or missing.
   */
  static get<T>(key: string): T | null {
    const entry = memoryStore.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      memoryStore.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set cache item with time-to-live (TTL) in seconds.
   */
  static set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    memoryStore.set(key, { value, expiresAt });
  }

  /**
   * Delete specific cache key or wildcard prefix.
   */
  static del(keyOrPrefix: string): void {
    if (memoryStore.has(keyOrPrefix)) {
      memoryStore.delete(keyOrPrefix);
      return;
    }

    // Prefix match
    for (const key of memoryStore.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        memoryStore.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries.
   */
  static flush(): void {
    memoryStore.clear();
  }
}

// Pre-defined Cache Keys
export const CACHE_KEYS = {
  PUBLIC_MENU: "cache:public:menu",
  CATEGORIES: "cache:public:categories",
  ANALYTICS_TODAY: "cache:analytics:today",
};

import { logger } from './logger';

export class CacheService {
  private static instance: CacheService;
  private memoryStore = new Map<string, { value: any; expiry: number | null }>();

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public get<T>(key: string): T | null {
    const item = this.memoryStore.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.value as T;
  }

  public set(key: string, value: any, ttlSeconds: number = 300): void {
    const expiry = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, { value, expiry });
  }

  public delete(key: string): void {
    this.memoryStore.delete(key);
  }

  public invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    this.memoryStore.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((k) => this.memoryStore.delete(k));
    logger.info(`Cache invalidated keys matching pattern: ${pattern} (Total: ${keysToDelete.length})`);
  }

  public clear(): void {
    this.memoryStore.clear();
  }
}

export const cache = CacheService.getInstance();

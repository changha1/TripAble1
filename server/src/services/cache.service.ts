import { LRUCache } from 'lru-cache';

export class CacheService {
  private static cache = new LRUCache<string, any>({
    max: 100, // 최대 100개 검색 조건 캐싱
    ttl: 1000 * 60 * 5, // 5분 동안 캐싱
  });

  public static get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  public static set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  public static generateKey(params: any): string {
    return JSON.stringify(params);
  }

  public static clear(): void {
    this.cache.clear();
  }
}

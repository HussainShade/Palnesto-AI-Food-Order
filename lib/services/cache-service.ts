/**
 * Cache service interface with Redis implementation
 * Provides caching layer for read-heavy operations
 * 
 * Implementation notes:
 * - Uses Redis in production (via ioredis or @upstash/redis)
 * - Falls back to in-memory cache for development
 * - TTL-based expiration
 * - Cache invalidation on writes
 */

type CacheKey = string;
type CacheValue = unknown;
type TTL = number; // seconds

interface CacheService {
  get<T>(key: CacheKey): Promise<T | null>;
  set(key: CacheKey, value: CacheValue, ttl?: TTL): Promise<void>;
  del(key: CacheKey): Promise<void>;
  delPattern(pattern: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * In-memory cache implementation (development fallback)
 * In production, replace with Redis implementation
 */
class InMemoryCacheService implements CacheService {
  private cache: Map<string, { value: CacheValue; expiresAt: number }> = new Map();

  async get<T>(key: CacheKey): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set(key: CacheKey, value: CacheValue, ttl: TTL = 3600): Promise<void> {
    const expiresAt = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: CacheKey): Promise<void> {
    this.cache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

/**
 * Redis cache implementation (production)
 * Uncomment and configure when Redis is available
 */
/*
import Redis from 'ioredis';

class RedisCacheService implements CacheService {
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async get<T>(key: CacheKey): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: CacheKey, value: CacheValue, ttl: TTL = 3600): Promise<void> {
    await this.client.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: CacheKey): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }
}
*/

// Cache key generators
export const CacheKeys = {
  foodItems: () => 'cache:food:items',
  foodItem: (id: string) => `cache:food:item:${id}`,
  foodIngredients: (id: string) => `cache:food:ingredients:${id}`,
  ingredients: () => 'cache:ingredients:all',
  ingredient: (id: string) => `cache:ingredient:${id}`,
  inventoryDashboard: () => 'cache:inventory:dashboard',
  aiAlerts: (isRead: boolean) => `cache:alerts:${isRead ? 'read' : 'unread'}`,
  orders: (page: number, pageSize: number) => `cache:orders:${page}:${pageSize}`,
} as const;

// Initialize cache service
// In production, use: export const cacheService = new RedisCacheService();
export const cacheService: CacheService = new InMemoryCacheService();


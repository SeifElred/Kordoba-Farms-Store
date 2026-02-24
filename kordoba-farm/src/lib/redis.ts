import Redis from "ioredis";

const getRedisUrl = () => process.env.REDIS_URL ?? "redis://localhost:6379";

/* eslint-disable no-var */
declare global {
  var redis: Redis | undefined;
}
/* eslint-enable no-var */

export const redis =
  globalThis.redis ??
  new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") globalThis.redis = redis;

export const CACHE_KEYS = {
  animalStock: (tagNumber: string) => `animal:stock:${tagNumber}`,
  eidCountdown: () => "eid:countdown",
  animalList: (locale: string, query: string) => `animals:${locale}:${query}`,
} as const;

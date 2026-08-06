import { getCache, setCache } from "../cache";

export function getCachedMetrics<T>(key = "metrics_full"): T | null {
  return getCache<T>(key);
}

export function setCachedMetrics<T>(data: T, key = "metrics_full"): void {
  setCache<T>(key, data);
}
